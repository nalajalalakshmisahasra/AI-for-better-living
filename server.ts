import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry headers as required by the system skill
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

/**
 * 1. POST /api/predict-scenario
 * Simulates city sector outcomes based on interactive parameters adjusted by stakeholders.
 */
app.post("/api/predict-scenario", async (req, res) => {
  try {
    const { sector, parameters, currentMetrics } = req.body;

    const systemInstruction = `
      You are the City-Scale Predictive Decision Intelligence Simulator.
      Your task is to analyze proposed parameter changes in a municipal sector and predict their downstream quantitative and qualitative impacts.
      
      Respond STRICTLY with a valid JSON object matching this schema:
      {
        "metrics": {
          "wellBeingIndex": number (value between 1 and 100 representing general community well-being/happiness),
          "costEfficiency": number (value between 1 and 100 representing resource & financial efficiency),
          "carbonFootprint": number (value between 1 and 100 representing carbon impact, where lower is better/greener),
          "publicSafety": number (value between 1 and 100 representing safety levels),
          "satisfaction": number (value between 1 and 100 representing citizen approval)
        },
        "insights": "A summary of predicted outcomes, detailing why these changes result in these scores.",
        "opportunities": ["Positive opportunity 1", "Positive opportunity 2"],
        "risks": ["Risk/trade-off 1", "Risk/trade-off 2"],
        "roadmap": [
          { "phase": "Phase 1: Immediate Actions", "tasks": ["Task 1", "Task 2"] },
          { "phase": "Phase 2: Operational Rollout", "tasks": ["Task 3", "Task 4"] }
        ]
      }
    `;

    const prompt = `
      Sector: ${sector}
      Current State Metrics: ${JSON.stringify(currentMetrics)}
      Proposed Policy/Parameter Modifications: ${JSON.stringify(parameters)}
      
      Analyze this adjustment. Calculate realistic municipal index shifts based on these parameters. 
      Ensure the numbers align with logical trade-offs (e.g. drastic funding cuts might increase costEfficiency but lower satisfaction and safety).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["metrics", "insights", "opportunities", "risks", "roadmap"],
          properties: {
            metrics: {
              type: Type.OBJECT,
              required: ["wellBeingIndex", "costEfficiency", "carbonFootprint", "publicSafety", "satisfaction"],
              properties: {
                wellBeingIndex: { type: Type.NUMBER },
                costEfficiency: { type: Type.NUMBER },
                carbonFootprint: { type: Type.NUMBER },
                publicSafety: { type: Type.NUMBER },
                satisfaction: { type: Type.NUMBER },
              }
            },
            insights: { type: Type.STRING },
            opportunities: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            risks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            roadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["phase", "tasks"],
                properties: {
                  phase: { type: Type.STRING },
                  tasks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      }
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText.trim()));
  } catch (error: any) {
    console.error("Predict Scenario Error:", error);
    res.status(500).json({ error: error.message || "Failed to simulate scenario" });
  }
});

/**
 * 2. POST /api/copilot-chat
 * Sector-specific Chat Copilot that responds with data-grounded insights and step-by-step mitigation plans.
 */
app.post("/api/copilot-chat", async (req, res) => {
  try {
    const { prompt, sector, dataset, activeParameters, history } = req.body;

    const systemInstruction = `
      You are the Sector Intelligence Assistant & Decision Copilot on the Decision Intelligence Platform.
      Your goal is to guide city officials, community leads, and individuals in making data-driven decisions.
      
      You have access to the following municipal context:
      - Active Sector: ${sector}
      - Reference Sector Dataset: ${JSON.stringify(dataset)}
      - Active Policy/Scenario Parameters: ${JSON.stringify(activeParameters)}

      Guidelines:
      1. Provide clear, objective, and action-oriented municipal advice.
      2. Keep responses structured using standard Markdown (tables, bullet points, and headers).
      3. Refer specifically to facts, potential anomalies, and trends in the dataset.
      4. Highlight cost-benefit and risk profiles in your analysis.
      5. Avoid using self-praising or hyperbolic adjectives. Do not mention system-internal files, paths, or container configs.
    `;

    // Convert the client-side history format to Gemini API part/contents standard if present
    const formattedContents: any[] = [];
    if (history && history.length > 0) {
      history.forEach((msg: any) => {
        formattedContents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      });
    }
    // Append the new prompt
    formattedContents.push({
      role: "user",
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Copilot Chat Error:", error);
    res.status(500).json({ error: error.message || "Failed to compile copilot response" });
  }
});

/**
 * 3. POST /api/generate-workflow
 * Automatically synthesizes an automation playbook recipe based on user-defined triggers.
 */
app.post("/api/generate-workflow", async (req, res) => {
  try {
    const { triggerDescription, sector } = req.body;

    const systemInstruction = `
      You are the Municipal Workflow Automation Architect.
      Given a high-level natural language description of a trigger/action policy, design a highly specific, realistic workflow recipe.
      
      Respond STRICTLY with a valid JSON object matching this schema:
      {
        "workflowName": "A professional name for the automation rule",
        "description": "Short explanation of the policy",
        "severity": "Low" | "Medium" | "High" | "Critical",
        "trigger": {
          "condition": "Specific technical condition description (e.g. AQI > 100)",
          "source": "Municipal sensor feed, telemetry line, or citizen report form"
        },
        "actions": [
          {
            "sequence": 1,
            "target": "Target department or notification system",
            "actionType": "Alert" | "Dispatch" | "System Update" | "API Call",
            "payload": "Concrete details of the action"
          }
        ],
        "playbookScript": "A human-readable markdown instruction manual for dispatchers or field teams on what to do if this rule triggers."
      }
    `;

    const prompt = `
      Sector context: ${sector}
      Trigger & Policy description: "${triggerDescription}"
      
      Generate a precise workflow playbook matching the required JSON format.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["workflowName", "description", "severity", "trigger", "actions", "playbookScript"],
          properties: {
            workflowName: { type: Type.STRING },
            description: { type: Type.STRING },
            severity: { type: Type.STRING },
            trigger: {
              type: Type.OBJECT,
              required: ["condition", "source"],
              properties: {
                condition: { type: Type.STRING },
                source: { type: Type.STRING }
              }
            },
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["sequence", "target", "actionType", "payload"],
                properties: {
                  sequence: { type: Type.NUMBER },
                  target: { type: Type.STRING },
                  actionType: { type: Type.STRING },
                  payload: { type: Type.STRING }
                }
              }
            },
            playbookScript: { type: Type.STRING }
          }
        }
      }
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText.trim()));
  } catch (error: any) {
    console.error("Generate Workflow Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate workflow recipe" });
  }
});

// Serve Vite-managed React application
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Decision Intelligence Platform server running on port ${PORT}`);
  });
}

bootstrap();
