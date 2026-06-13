import type { Project, Employee } from '../types';

interface AttributionResult {
  projectId: string;
  confidence: number;
  method: 'heuristic' | 'llm';
  explanation: string;
}

// Local heuristics keywords database
const PROJECT_KEYWORDS: Record<string, string[]> = {
  'proj-bhp': ['bharatpay', 'upi', 'merchant', 'onboarding', 'payment gateway', 'pos', 'checkout', 'qr code', 'settlement', 'reconciliation', 'transaction'],
  'proj-adb': ['aadhaar', 'uidai', 'kyc', 'biometric', 'identity', 'verification', 'bridge', 'gateway', 'auth', 'security', 'audit', 'compliance'],
  'proj-ayl': ['ayushman', 'health stack', 'abdm', 'consent manager', 'health records', 'e-sanjeevani', 'hospital', 'integration', 'clinical'],
  'proj-ondc': ['ondc', 'open commerce', 'buyer app', 'seller app', 'registry', 'gateway', 'e-commerce', 'catalogue', 'network'],
  'proj-admin': ['all-hands', 'hr', '1-on-1', 'one-on-one', 'chai', 'catchup', 'lunch', 'administrative', 'operation', 'announcement', 'office', 'review']
};

export const aiService = {
  /**
   * Run the local heuristic attribution model.
   */
  runHeuristic(meeting: { title: string; description: string; attendeeEmails: string[] }, projects: Project[], employees: Employee[]): AttributionResult {
    const title = meeting.title.toLowerCase();
    const description = meeting.description.toLowerCase();
    const textToSearch = `${title} ${description}`;

    let bestProjectId = 'unattributed';
    let maxScore = 0;
    const scores: Record<string, number> = {};
    const matchingKeywords: Record<string, string[]> = {};

    // 1. Check direct project code matches
    for (const project of projects) {
      if (project.id === 'unattributed') continue;
      
      const code = project.code.toLowerCase();
      const name = project.name.toLowerCase();

      scores[project.id] = 0;
      matchingKeywords[project.id] = [];

      // Big boost for project code (e.g. PROJ-POL)
      if (textToSearch.includes(code)) {
        scores[project.id] += 15;
        matchingKeywords[project.id].push(project.code);
      }
      
      // Medium boost for project name (e.g. Polaris)
      if (textToSearch.includes(name)) {
        scores[project.id] += 8;
        matchingKeywords[project.id].push(project.name);
      }

      // Keyword matching
      const keywords = PROJECT_KEYWORDS[project.id] || [];
      for (const keyword of keywords) {
        if (textToSearch.includes(keyword)) {
          // Title matches count double
          const titleMatchCount = (title.match(new RegExp(keyword, 'g')) || []).length;
          const descMatchCount = (description.match(new RegExp(keyword, 'g')) || []).length;
          
          const keywordScore = (titleMatchCount * 3) + descMatchCount;
          if (keywordScore > 0) {
            scores[project.id] += keywordScore;
            matchingKeywords[project.id].push(keyword);
          }
        }
      }
    }

    // 2. Attendee-based boosting (who is attending?)
    // Count how many attendees are primarily assigned to each project
    const attendeeCountByProject: Record<string, number> = {};
    const projectAttendees: Record<string, string[]> = {};
    
    for (const email of meeting.attendeeEmails) {
      const emp = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
      if (emp && emp.primaryProjectId) {
        attendeeCountByProject[emp.primaryProjectId] = (attendeeCountByProject[emp.primaryProjectId] || 0) + 1;
        if (!projectAttendees[emp.primaryProjectId]) {
          projectAttendees[emp.primaryProjectId] = [];
        }
        projectAttendees[emp.primaryProjectId].push(emp.name);
      }
    }

    for (const projectId in attendeeCountByProject) {
      if (scores[projectId] !== undefined) {
        // Boost score based on percentage of team members present
        const count = attendeeCountByProject[projectId];
        scores[projectId] += count * 1.5;
      }
    }

    // 3. Find the highest scoring project
    for (const projectId in scores) {
      if (scores[projectId] > maxScore) {
        maxScore = scores[projectId];
        bestProjectId = projectId;
      }
    }

    // 4. Calculate confidence score
    let confidence = 0;
    let explanation = '';

    if (bestProjectId === 'unattributed' || maxScore === 0) {
      // Check if it's general sync or standup (often unattributed if multiple teams are present)
      if (title.includes('sync') || title.includes('standup') || title.includes('meeting')) {
        explanation = 'Categorized as unattributed due to lack of distinct project keywords or mixed project team members.';
      } else {
        explanation = 'Could not find matching keywords or team profiles for any project.';
      }
      return {
        projectId: 'unattributed',
        confidence: 0.20,
        method: 'heuristic',
        explanation
      };
    }

    // Normalize confidence based on score strength
    // A score of 15+ is almost certain (e.g. 95%+)
    confidence = Math.min(0.99, 0.25 + (maxScore / 18) * 0.74);
    
    // Penalize confidence if there is another project with a close score (ambiguity)
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    if (sortedScores.length > 1 && sortedScores[0][0] === bestProjectId) {
      const runnerUpScore = sortedScores[1][1];
      if (runnerUpScore > 0 && (maxScore - runnerUpScore) < 3) {
        confidence = Math.max(0.3, confidence - 0.25); // reduce confidence due to competing project match
      }
    }

    // Build the explanation
    const matchProj = projects.find(p => p.id === bestProjectId);
    const keywordsUsed = matchingKeywords[bestProjectId] || [];
    const attendeesCount = attendeeCountByProject[bestProjectId] || 0;
    
    explanation = `Attributed to ${matchProj?.name || bestProjectId}`;
    if (keywordsUsed.length > 0) {
      explanation += ` based on keywords: [${keywordsUsed.slice(0, 3).join(', ')}]`;
    }
    if (attendeesCount > 0) {
      explanation += `${keywordsUsed.length > 0 ? ' and' : ' based on'} attendance of team members: ${projectAttendees[bestProjectId].slice(0, 2).join(', ')}`;
    }
    explanation += `.`;

    return {
      projectId: bestProjectId,
      confidence: parseFloat(confidence.toFixed(2)),
      method: 'heuristic',
      explanation
    };
  },

  /**
   * Run Gemini-powered attribution via direct API fetch.
   */
  async runGemini(
    meeting: { title: string; description: string; attendeeEmails: string[]; durationMinutes: number },
    projects: Project[],
    employees: Employee[],
    apiKey: string
  ): Promise<AttributionResult> {
    try {
      // Map project lists into a neat prompt representation
      const projectListStr = projects
        .map(p => `ID: "${p.id}", Name: "${p.name}", Code: "${p.code}", Description: "${p.description}"`)
        .join('\n');

      // Map attendees names & roles
      const attendeeListStr = meeting.attendeeEmails
        .map(email => {
          const emp = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
          return emp ? `${emp.name} (${emp.role}, Primary Project: ${emp.primaryProjectId || 'none'})` : email;
        })
        .join(', ');

      const prompt = `You are an HR Time & Cost Attribution AI.
We need to attribute a corporate meeting to one of the active project streams.

Here are the active projects in the system:
${projectListStr}
(Note: You can also attribute the project to "proj-admin" for internal HR/Operations, or return "unattributed" if the context is highly ambiguous).

Here is the meeting detail to attribute:
- Title: "${meeting.title}"
- Description: "${meeting.description}"
- Duration: ${meeting.durationMinutes} minutes
- Attendees: [${attendeeListStr}]

Analyze the context:
1. Matching codes, keywords, or synonyms in the title and description.
2. Attendee alignment: if all or most attendees are on a specific project, it suggests that project.
3. If it is a generic recurring operational meeting, All-Hands, HR catchup, or administrative task, use "proj-admin".
4. If there is absolutely no signal or conflicting signals, return "unattributed".

You must output a JSON object exactly formatted as:
{
  "projectId": "the-selected-project-id",
  "confidence": 0.95, // a decimal score between 0.00 and 1.00
  "explanation": "Brief explanation of why it was attributed here."
}`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const resData = await response.json();
      const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      const parsed = JSON.parse(text.trim());
      
      // Validate project exists
      let finalProjectId = parsed.projectId;
      if (finalProjectId !== 'unattributed' && !projects.some(p => p.id === finalProjectId)) {
        finalProjectId = 'unattributed';
      }

      return {
        projectId: finalProjectId,
        confidence: parsed.confidence ?? 0.5,
        method: 'llm',
        explanation: parsed.explanation ?? 'Attributed via Gemini LLM analysis.'
      };
    } catch (e) {
      console.warn('Gemini API call failed, falling back to local heuristics:', e);
      // Fallback
      return this.runHeuristic(meeting, projects, employees);
    }
  }
};
