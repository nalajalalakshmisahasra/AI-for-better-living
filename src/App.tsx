import React, { useState, useEffect, useRef } from "react";
import {
  Bus,
  HeartPulse,
  Leaf,
  Zap,
  ShieldAlert,
  Wrench,
  Settings,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Send,
  Play,
  Copy,
  Check,
  Activity,
  TrendingUp,
  BarChart3,
  Plus,
  Trash2,
  HelpCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Calendar,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { SECTORS, SectorDefinition, MetricCardData, ChatMessage, SimulationResult, AutomationWorkflow } from "./types";
import MarkdownRenderer from "./components/MarkdownRenderer";

export default function App() {
  const [activeSectorKey, setActiveSectorKey] = useState<string>("mobility");
  const currentSector = SECTORS[activeSectorKey];

  // Tab State
  const [activeTab, setActiveTab] = useState<"simulation" | "automation">("simulation");

  // Slider State (dynamic params for the selected sector)
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [simulationLogIndex, setSimulationLogIndex] = useState(0);

  // Chat/Copilot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Automation / Workflow State
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [customTrigger, setCustomTrigger] = useState("");
  const [isGeneratingWorkflow, setIsGeneratingWorkflow] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<AutomationWorkflow | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Loading phase logs for simulation
  const SIMULATION_LOGS = [
    "Fetching current municipal telemetry arrays...",
    "Querying Gemini predictive simulation engine...",
    "Assessing policy impacts on well-being and carbon factors...",
    "Modeling public safety risks and citizen approval ratings...",
    "Structuring execution roadmap timeline...",
  ];

  // Initialize sector-specific parameters and chat greetings
  useEffect(() => {
    // Reset parameters
    const defaultVals: Record<string, number> = {};
    currentSector.parameters.forEach((p) => {
      defaultVals[p.id] = p.defaultValue;
    });
    setSliderValues(defaultVals);

    // Clear simulation outcome to baseline
    setSimulationResult(null);

    // Set sector greetings
    const sectorGreeting: ChatMessage = {
      id: "greet-" + Date.now(),
      role: "model",
      text: `Hello! I am your **${currentSector.name} Copilot**. I have loaded the active telemetry logs and parameters. 

Adjust any variables on the simulator, or ask me to:
- Conduct an exhaustive **SWOT Analysis** on current policy levels.
- Formulate an **environmental or budget mitigation plan** based on telemetry anomalies.
- Draft a **citizen communication brief** detailing potential changes.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages([sectorGreeting]);

    // Initialize workflows with sample triggers for the sector
    const defaultWorkflows: AutomationWorkflow[] = currentSector.sampleTriggers.map((trig, idx) => ({
      id: `w-default-${idx}`,
      workflowName: `Auto-Response Policy ${idx + 1}`,
      description: "Predefined dispatch rules compiled by municipal specialists.",
      severity: idx === 0 ? "Critical" : "High",
      trigger: {
        condition: trig.split("trigger")[0].trim(),
        source: "Dynamic Sensor Grid Feed",
      },
      actions: [
        {
          sequence: 1,
          target: "Municipal Operations Center (MOC)",
          actionType: "Alert",
          payload: "Broadcast high-priority warning to active sector operators.",
        },
        {
          sequence: 2,
          target: "Emergency Dispatch System",
          actionType: "Dispatch",
          payload: "Route auxiliary support assets to flagged coordinates.",
        }
      ],
      playbookScript: `### Predefined Operational Script
1. Verify telemetry warning authenticity.
2. Cross-reference municipal database metrics.
3. Deploy response resources immediately.
4. Issue public notifications via standard news broadcasts.`
    }));
    setWorkflows(defaultWorkflows);
    setSelectedWorkflow(defaultWorkflows[0] || null);
  }, [activeSectorKey]);

  // Scroll to chat end when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Handle parameter slider adjustments
  const handleSliderChange = (id: string, val: number) => {
    setSliderValues((prev) => ({
      ...prev,
      [id]: val,
    }));
  };

  // Run full policy simulation
  const triggerSimulation = async () => {
    setIsSimulating(true);
    setSimulationLogIndex(0);

    // Interval to cycle through realistic loading text logs
    const logInterval = setInterval(() => {
      setSimulationLogIndex((prev) => {
        if (prev < SIMULATION_LOGS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    try {
      const response = await fetch("/api/predict-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sector: currentSector.name,
          parameters: sliderValues,
          currentMetrics: currentSector.defaultMetrics,
        }),
      });

      if (!response.ok) throw new Error("Simulation server failed");
      const data = await response.json();
      setSimulationResult(data);

      // Append results brief to chat as system insight
      const simBrief: ChatMessage = {
        id: "sim-brief-" + Date.now(),
        role: "model",
        text: `### Simulated Policy Metrics Updated!
I have simulated your proposed policies. Here is a brief summary of my predictions:
* **Well-being Index**: ${data.metrics.wellBeingIndex}/100
* **Cost Efficiency**: ${data.metrics.costEfficiency}/100
* **Carbon Footprint**: ${data.metrics.carbonFootprint}/100
* **Public Safety**: ${data.metrics.publicSafety}/100
* **Citizen Satisfaction**: ${data.metrics.satisfaction}/100

**Key Insight:** ${data.insights}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, simBrief]);
    } catch (err) {
      console.error(err);
      alert("Could not complete the simulation. Please check your network connection.");
    } finally {
      clearInterval(logInterval);
      setIsSimulating(false);
    }
  };

  // Send a custom message to the Decision Copilot
  const sendChatMessage = async (overrideText?: string) => {
    const messageText = overrideText || chatInput;
    if (!messageText.trim()) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!overrideText) setChatInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/copilot-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: messageText,
          sector: currentSector.name,
          dataset: currentSector.telemetry,
          activeParameters: sliderValues,
          history: chatMessages.slice(-8), // Send recent context
        }),
      });

      if (!response.ok) throw new Error("Chat server error");
      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: "model-" + Date.now(),
        role: "model",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: "err-" + Date.now(),
        role: "model",
        text: "I encountered an error querying the intelligence engine. Please retry.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Trigger dispatch copilot request for an active anomaly
  const handleDispatchResolution = (anomaly: any) => {
    const dispatchPrompt = `ALERT: The telemetry feed detected a ${anomaly.status} condition at "${anomaly.location}". 
The flagged parameter is **${anomaly.parameter}** with a reading of **${anomaly.value}**. 

Provide a highly specific mitigation playbook, list required municipal teams to deploy, and assess the impact of this anomaly on our active scenario metrics.`;
    
    // Switch tab to simulation if we aren't already
    setActiveTab("simulation");
    sendChatMessage(dispatchPrompt);
  };

  // Generate automated workflow rule
  const handleGenerateWorkflow = async () => {
    if (!customTrigger.trim()) return;
    setIsGeneratingWorkflow(true);

    try {
      const response = await fetch("/api/generate-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          triggerDescription: customTrigger,
          sector: currentSector.name,
        }),
      });

      if (!response.ok) throw new Error("Workflow generator failed");
      const data = await response.json();

      const newWorkflow: AutomationWorkflow = {
        id: `w-gen-${Date.now()}`,
        ...data,
      };

      setWorkflows((prev) => [newWorkflow, ...prev]);
      setSelectedWorkflow(newWorkflow);
      setCustomTrigger("");

      // Notify in Copilot
      const workflowBrief: ChatMessage = {
        id: "wf-brief-" + Date.now(),
        role: "model",
        text: `### ⚙️ Automated Workflow Recipe Compiled!
I have successfully compiled your trigger: **"${newWorkflow.workflowName}"**.
* **Trigger Condition**: ${newWorkflow.trigger.condition}
* **Severity Classification**: **${newWorkflow.severity}**
* **Integration Payload**: Sent to ${newWorkflow.actions[0]?.target || "Municipal systems"}.

You can view the full compiled Playbook Script in the **Automated Workflows** tab.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, workflowBrief]);
    } catch (err) {
      console.error(err);
      alert("Failed to generate automated workflow. Try simplifying your rule description.");
    } finally {
      setIsGeneratingWorkflow(false);
    }
  };

  // Copy playbook to clipboard
  const copyPlaybook = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Prepare active chart data based on simulated predictions
  const getChartData = () => {
    const baseTrend = currentSector.trendData;
    if (!simulationResult) return baseTrend;

    // Simulate predictive curve shifts based on simulation outcome
    const targetDelta = (simulationResult.metrics.wellBeingIndex - currentSector.defaultMetrics.wellBeingIndex) * 0.15;
    return baseTrend.map((item) => {
      if (item.predicted !== undefined) {
        return {
          ...item,
          predicted: Math.min(100, Math.max(10, Math.round(item.predicted + targetDelta))),
        };
      }
      return item;
    });
  };

  // Get current state metrics (use simulated ones if simulated, otherwise default)
  const activeMetrics: MetricCardData = simulationResult ? simulationResult.metrics : currentSector.defaultMetrics;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* 1. Global Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2.5 rounded-lg flex items-center justify-center shadow-md">
            <Activity className="h-5 w-5 animate-pulse text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 font-display">
              MuniPulse <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">Decision Intelligence</span>
            </h1>
            <p className="text-xs text-slate-500">Autonomous Municipal Telemetry & AI Forecasting System</p>
          </div>
        </div>
        
        {/* Right side status */}
        <div className="hidden md:flex items-center gap-6 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>UTC: 2026-07-06 07:34</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Grid Services Active</span>
          </div>
        </div>
      </header>

      {/* 2. Municipal Sectors Navigation Bar */}
      <div className="bg-slate-900 text-slate-300 px-6 py-1.5 flex gap-2 overflow-x-auto shadow-inner border-b border-slate-950">
        {Object.values(SECTORS).map((sector) => {
          const isSelected = sector.id === activeSectorKey;
          const SectorIcon =
            sector.icon === "Bus"
              ? Bus
              : sector.icon === "HeartPulse"
              ? HeartPulse
              : sector.icon === "Leaf"
              ? Leaf
              : sector.icon === "Zap"
              ? Zap
              : ShieldAlert;

          return (
            <button
              key={sector.id}
              onClick={() => setActiveSectorKey(sector.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-medium transition-all duration-150 whitespace-nowrap focus:outline-none ${
                isSelected
                  ? "bg-white text-slate-950 font-semibold shadow-md border-t-2 border-indigo-600"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <SectorIcon className={`h-4 w-4 ${isSelected ? "text-indigo-600" : "text-slate-400"}`} />
              {sector.name}
            </button>
          );
        })}
      </div>

      {/* 3. Core Workspace Layout */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
        
        {/* Left Interactive Playground Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* Sector Header / Description */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 font-mono">Active Monitoring Sector</span>
              <h2 className="text-xl font-bold text-slate-900 font-display">{currentSector.name}</h2>
              <p className="text-sm text-slate-600 max-w-2xl">{currentSector.description}</p>
            </div>

            {/* Quick Navigation Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 self-start">
              <button
                onClick={() => setActiveTab("simulation")}
                className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                  activeTab === "simulation"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tuning & Simulation
              </button>
              <button
                onClick={() => setActiveTab("automation")}
                className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                  activeTab === "automation"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Automated Workflows ({workflows.length})
              </button>
            </div>
          </div>

          {/* SIMULATION & PLAYGROUND TAB */}
          {activeTab === "simulation" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Variable Tuner & Policy Modeler */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 font-display">
                      <Settings className="h-4 w-4 text-indigo-600" />
                      Policy Parameter Tuner
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">Modify inputs to test outcomes</span>
                  </div>

                  <div className="space-y-5">
                    {currentSector.parameters.map((param) => {
                      const val = sliderValues[param.id] !== undefined ? sliderValues[param.id] : param.defaultValue;
                      const isModified = val !== param.defaultValue;

                      return (
                        <div key={param.id} className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                              {param.label}
                              {isModified && (
                                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] px-1.5 py-0.2 rounded-full font-mono">
                                  Modified
                                </span>
                              )}
                            </span>
                            <span className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {val} {param.unit}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={param.min}
                            max={param.max}
                            step={param.step}
                            value={val}
                            onChange={(e) => handleSliderChange(param.id, Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>Min: {param.min}</span>
                            <span>Default: {param.defaultValue}</span>
                            <span>Max: {param.max}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Simulate Button */}
                <div className="pt-4 border-t border-slate-150">
                  <button
                    onClick={triggerSimulation}
                    disabled={isSimulating}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl text-sm transition-all duration-150 flex items-center justify-center gap-2.5 shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    {isSimulating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-white" />
                        <span>Simulating Municipal Downstream Impacts...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 text-white fill-white" />
                        <span>Simulate Policy Decision</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Simulation Result / Baseline Forecast */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 font-display">
                      <TrendingUp className="h-4 w-4 text-indigo-600" />
                      Predictive Outcome Analysis
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                      {simulationResult ? "Forecast Active" : "Baseline State"}
                    </span>
                  </div>

                  {/* LOADING SIMULATOR LOGS */}
                  {isSimulating ? (
                    <div className="h-80 flex flex-col items-center justify-center space-y-4">
                      <div className="relative flex items-center justify-center">
                        <div className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-indigo-600 opacity-20"></div>
                        <div className="bg-indigo-600 text-white p-4 rounded-full shadow-lg">
                          <Sparkles className="h-6 w-6 animate-pulse" />
                        </div>
                      </div>
                      <div className="text-center space-y-1.5 max-w-sm px-4">
                        <p className="text-xs font-mono text-indigo-600 font-bold tracking-widest uppercase">AI Synthesis Pipeline</p>
                        <p className="text-sm text-slate-800 font-medium h-10 transition-all duration-300">
                          {SIMULATION_LOGS[simulationLogIndex]}
                        </p>
                        <div className="w-48 h-1 bg-slate-100 rounded-full mx-auto overflow-hidden">
                          <div className="h-full bg-indigo-600 animate-[loading_5s_ease-in-out_infinite] rounded-full" style={{ width: `${(simulationLogIndex + 1) * 20}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      
                      {/* Metric Shifts Comparison */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {Object.entries(activeMetrics).map(([key, val]) => {
                          const label = key.replace(/([A-Z])/g, " $1");
                          const isIncreased = simulationResult && val > (currentSector.defaultMetrics as any)[key];
                          const isDecreased = simulationResult && val < (currentSector.defaultMetrics as any)[key];
                          const baseVal = (currentSector.defaultMetrics as any)[key];
                          const delta = val - baseVal;

                          return (
                            <div key={key} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-between h-24">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">{label}</span>
                              <div className="flex items-baseline justify-between mt-1">
                                <span className="text-2xl font-bold text-slate-900 font-display">{val}</span>
                                {simulationResult && (isIncreased || isDecreased) && (
                                  <span className={`text-[9px] font-bold font-mono px-1 py-0.2 rounded flex items-center ${
                                    isIncreased 
                                      ? (key === "carbonFootprint" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700") 
                                      : (key === "carbonFootprint" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")
                                  }`}>
                                    {isIncreased ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                                    {Math.abs(delta)}
                                  </span>
                                )}
                              </div>
                              <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${val}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Qualitative Insights display */}
                      {simulationResult ? (
                        <div className="space-y-4">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 font-mono">Copilot Simulation Insights</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">{simulationResult.insights}</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                              <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-display">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                Predicted Opportunities
                              </h5>
                              <ul className="list-disc pl-4 text-xs text-emerald-800 space-y-1">
                                {simulationResult.opportunities.map((opp, idx) => (
                                  <li key={idx}>{opp}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                              <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-display">
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                                Projected System Risks
                              </h5>
                              <ul className="list-disc pl-4 text-xs text-amber-800 space-y-1">
                                {simulationResult.risks.map((risk, idx) => (
                                  <li key={idx}>{risk}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Roadmap */}
                          <div className="border-t border-slate-100 pt-3">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 font-display">Suggested Action Roadmap</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {simulationResult.roadmap.map((phase, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200">
                                  <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wide font-mono">{phase.phase}</span>
                                  <ul className="space-y-1 text-xs text-slate-600">
                                    {phase.tasks.map((task, tid) => (
                                      <li key={tid} className="flex items-start gap-1.5">
                                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                                        <span>{task}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center h-72">
                          <HelpCircle className="h-10 w-10 text-slate-400 mb-2" />
                          <h4 className="text-sm font-bold text-slate-800 font-display">No active policy adjustment simulated</h4>
                          <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                            Modify parameters on the left and click "Simulate Policy Decision" to analyze potential municipal well-being offsets, trade-offs, and custom execution roadmap.
                          </p>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              </div>

              {/* Real-time Telemetry Anomalies List */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 font-display">
                      <AlertCircle className="h-4 w-4 text-indigo-600" />
                      Active Telemetry Anomalies
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">Live Feed</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs text-slate-600 text-left font-sans">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-bold">
                          <th className="py-2.5">Location/Source</th>
                          <th className="py-2.5">Parameter</th>
                          <th className="py-2.5">Reading</th>
                          <th className="py-2.5">Alert Level</th>
                          <th className="py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {currentSector.telemetry.map((anomaly) => (
                          <tr key={anomaly.id} className="hover:bg-slate-50">
                            <td className="py-3 font-semibold text-slate-900">{anomaly.location}</td>
                            <td className="py-3">{anomaly.parameter}</td>
                            <td className="py-3 font-mono font-bold text-slate-800">{anomaly.value}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                anomaly.status === "Critical" 
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : anomaly.status === "Warning"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}>
                                {anomaly.status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              {anomaly.status !== "Normal" ? (
                                <button
                                  onClick={() => handleDispatchResolution(anomaly)}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm transition-all flex items-center gap-1 inline-flex"
                                >
                                  <span>Resolve</span>
                                  <ArrowRight className="h-2.5 w-2.5" />
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium">Stable</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 font-mono mt-4 pt-3 border-t border-slate-100">
                  * Live telemetry points are bound to municipal GIS databases. Click "Resolve" to auto-draft mitigations in the Decision Copilot.
                </p>
              </div>

              {/* Analytics / Metric Trends Visualizer */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 font-display">
                      <BarChart3 className="h-4 w-4 text-indigo-600" />
                      Sector Metric Trends & Forecast
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">Community Well-being Projection</span>
                  </div>

                  <div className="h-64 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[20, 100]} />
                        <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                        <Legend wrapperStyle={{ fontSize: "11px" }} />
                        <Area type="monotone" dataKey="metricValue" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" name="Baseline / Active Rating" />
                        {simulationResult && (
                          <Area type="monotone" dataKey="predicted" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPredicted)" name="AI Simulated Prediction" strokeDasharray="5 5" />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 font-mono mt-4 pt-3 border-t border-slate-100">
                  * Standard error margin 2.4%. Predictions are calculated via continuous historical integration.
                </p>
              </div>

            </div>
          )}

          {/* AUTOMATED WORKFLOWS TAB */}
          {activeTab === "automation" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Section: Active Rules List */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 font-display">
                    <Wrench className="h-4 w-4 text-indigo-600" />
                    Active Rule Automation
                  </h3>
                  <p className="text-xs text-slate-500">Autonomous triggers listening to sector sensor networks</p>
                </div>

                {/* Workflow Cards */}
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {workflows.map((wf) => {
                    const isSelected = selectedWorkflow?.id === wf.id;
                    return (
                      <div
                        key={wf.id}
                        onClick={() => setSelectedWorkflow(wf)}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <h4 className="text-xs font-bold truncate pr-2 font-display">{wf.workflowName}</h4>
                          <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full uppercase shrink-0 font-mono ${
                            wf.severity === "Critical"
                              ? (isSelected ? "bg-red-500 text-white border border-red-400" : "bg-red-50 text-red-700 border border-red-200")
                              : wf.severity === "High"
                              ? (isSelected ? "bg-amber-500 text-slate-900 border border-amber-400" : "bg-amber-50 text-amber-700 border border-amber-200")
                              : "bg-slate-200 text-slate-700"
                          }`}>
                            {wf.severity}
                          </span>
                        </div>
                        <p className={`text-[11px] line-clamp-2 leading-relaxed mb-3 ${isSelected ? "text-slate-100" : "text-slate-500"}`}>
                          {wf.trigger.condition}
                        </p>
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className={isSelected ? "text-sky-200 font-bold" : "text-indigo-600"}>
                            {wf.actions.length} Action Step{wf.actions.length > 1 ? "s" : ""}
                          </span>
                          <span className={isSelected ? "text-slate-300" : "text-slate-400"}>{wf.trigger.source}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Middle Section: Create Custom Automation Playbook */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="border-b border-slate-100 pb-3 mb-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 font-display">
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                      Generate New AI Playbook
                    </h3>
                    <p className="text-xs text-slate-500">Draft raw rules in English and compile with Gemini</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Trigger & Policy Description</label>
                      <textarea
                        value={customTrigger}
                        onChange={(e) => setCustomTrigger(e.target.value)}
                        placeholder={`e.g. If emergency dispatch calls exceed 5 per hour, broadcast alerts to nearby standby first-responders and reserve 2 community centers...`}
                        className="w-full h-32 p-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 placeholder:text-slate-400 bg-slate-50 text-slate-800"
                      />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-500 space-y-1">
                      <p className="font-semibold text-slate-700 font-display">What Gemini will build:</p>
                      <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                        <li>An evaluation schema targeting specific telemetry arrays.</li>
                        <li>A multi-stage dispatch action block payload.</li>
                        <li>An operational playbook script instructing field dispatchers.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGenerateWorkflow}
                  disabled={isGeneratingWorkflow || !customTrigger.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 mt-4 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md"
                >
                  {isGeneratingWorkflow ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-white" />
                      <span>Compiling Playbook Recipe...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 text-white" />
                      <span>Compile Playbook</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Section: Selected Playbook Details View */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1 space-y-4 flex flex-col justify-between">
                {selectedWorkflow ? (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Workflow Meta */}
                      <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 font-display">{selectedWorkflow.workflowName}</h3>
                          <p className="text-xs text-slate-500 mt-1">{selectedWorkflow.description}</p>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                          {selectedWorkflow.severity}
                        </span>
                      </div>

                      {/* Technical Blueprint Info */}
                      <div className="space-y-3 mt-4 text-xs">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-150">
                          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Listener Source</span>
                          <span className="font-mono text-[11px] font-semibold text-slate-800">{selectedWorkflow.trigger.source}</span>
                          <span className="text-[10px] uppercase font-mono text-slate-400 block mt-2.5 mb-1">Trigger Condition</span>
                          <span className="font-mono text-[11px] bg-white px-2 py-1 border rounded block border-slate-200 text-slate-900 break-words">
                            {selectedWorkflow.trigger.condition}
                          </span>
                        </div>

                        {/* Action Steps Sequence */}
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-wide font-mono">Automation Sequences</span>
                          <div className="space-y-2">
                            {selectedWorkflow.actions.map((act) => (
                              <div key={act.sequence} className="flex gap-2.5 items-start p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                                <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                  {act.sequence}
                                </span>
                                <div className="space-y-0.5">
                                  <div className="flex gap-2 items-center">
                                    <span className="font-semibold text-slate-800 text-[11px]">{act.target}</span>
                                    <span className="text-[9px] px-1 bg-slate-100 border border-slate-200 text-slate-500 rounded font-mono">{act.actionType}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 leading-normal">{act.payload}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Operational Playbook Script */}
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">Manual Playbook Script</span>
                        <button
                          onClick={() => copyPlaybook(selectedWorkflow.playbookScript, selectedWorkflow.id)}
                          className="text-[10px] text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-semibold"
                        >
                          {copiedId === selectedWorkflow.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy Script</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-lg border border-slate-950 text-xs font-mono text-slate-200 max-h-40 overflow-y-auto leading-relaxed whitespace-pre-wrap shadow-inner">
                        {selectedWorkflow.playbookScript}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                    <Wrench className="h-10 w-10 mb-2" />
                    <p className="text-sm font-semibold font-display">Select an automation workflow to view playbooks</p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* PERSISTENT AI DECISION COPILOT PANEL (RIGHT SIDE) */}
        <div className="w-full xl:w-96 bg-white border-t xl:border-t-0 xl:border-l border-slate-200 flex flex-col h-[600px] xl:h-auto shrink-0 shadow-lg">
          
          {/* Copilot Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 text-white p-1.5 rounded-lg flex items-center justify-center shadow-md">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-display">AI Decision Copilot</h3>
                <p className="text-[10px] text-slate-400 font-mono">Bound to {currentSector.name}</p>
              </div>
            </div>
            
            {/* Reset button */}
            <button
              onClick={() => {
                const sectorGreeting: ChatMessage = {
                  id: "greet-" + Date.now(),
                  role: "model",
                  text: `Hello! I am your **${currentSector.name} Copilot**. Context initialized. Ask me to help analyze metrics, telemetry, or rules!`,
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                };
                setChatMessages([sectorGreeting]);
              }}
              title="Reset Chat Context"
              className="p-1 text-slate-400 hover:text-indigo-600 rounded transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
            {chatMessages.map((msg) => {
              const isModel = msg.role === "model";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${isModel ? "self-start" : "self-end ml-auto"}`}
                >
                  <div className={`p-3 rounded-xl border shadow-sm ${
                    isModel 
                      ? "bg-white text-slate-800 border-slate-200" 
                      : "bg-indigo-600 text-white border-indigo-600"
                  }`}>
                    <MarkdownRenderer content={msg.text} />
                  </div>
                  <span className={`text-[9px] font-mono text-slate-400 mt-1 ${isModel ? "self-start" : "self-end mr-1"}`}>
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex flex-col max-w-[80%] self-start">
                <div className="p-3 rounded-xl border bg-white border-slate-200 flex items-center gap-2 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Analyzing scenario variables...</span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick-Prompt Suggestions */}
          <div className="p-3 bg-slate-100 border-t border-slate-200 flex gap-2 overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => sendChatMessage("Conduct an exhaustive SWOT Analysis of our active policy settings.")}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-[10px] font-semibold text-slate-700 px-2.5 py-1.5 rounded-lg shadow-sm shrink-0 transition hover:text-indigo-600"
            >
              📊 SWOT Analysis
            </button>
            <button
              onClick={() => sendChatMessage("Detail an environment and community wellness action plan to address active warning anomalies.")}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-[10px] font-semibold text-slate-700 px-2.5 py-1.5 rounded-lg shadow-sm shrink-0 transition hover:text-indigo-600"
            >
              🌿 Mitigate Warnings
            </button>
            <button
              onClick={() => sendChatMessage("Draft a professional 200-word citizen brief notifying the public of these potential scenario parameters.")}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-[10px] font-semibold text-slate-700 px-2.5 py-1.5 rounded-lg shadow-sm shrink-0 transition hover:text-indigo-600"
            >
              📢 Citizen Brief
            </button>
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendChatMessage();
            }}
            className="p-3 border-t border-slate-200 bg-white flex gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Ask ${currentSector.name} Copilot...`}
              disabled={isTyping}
              className="flex-1 p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-800 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={isTyping || !chatInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white p-2.5 rounded-lg transition shadow-md shrink-0 flex items-center justify-center focus:outline-none"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
