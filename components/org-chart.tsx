'use client';

import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    Connection,
    addEdge,
    MiniMap,
    ConnectionMode,
    BackgroundVariant,
    MarkerType,
    Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import OrgNode from './org-node';
import { getOrgChartData, updateOrgHierarchy } from '@/app/actions/organization';
import {
    Loader2, RefreshCw, Building2, Users, Layers,
    ArrowDown, Sparkles, Target, GitBranch, FileText,
    Download
} from 'lucide-react';
import { Button } from './ui/button';
import { OrgReportModal } from './organization/org-report-modal';

// Registra os tipos de nós customizados
const nodeTypes = {
    orgNode: OrgNode,
};

export function OrgChart() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);
    const [reportOpen, setReportOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getOrgChartData();
            // @ts-ignore
            setNodes(data.nodes);
            // @ts-ignore  
            setEdges(data.edges.map((e: any) => ({
                ...e,
                type: 'smoothstep',
                animated: false,
                style: {
                    stroke: 'url(#org-edge-gradient)',
                    strokeWidth: 2,
                    strokeLinecap: 'round'
                },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: '#64748b',
                    width: 14,
                    height: 14
                }
            })));
        } catch (error) {
            console.error("Erro ao carregar organograma:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Handler para quando uma conexão é feita
    const onConnect = useCallback(async (params: Connection) => {
        if (params.source === params.target) return;

        const result = await updateOrgHierarchy(params.target!, params.source!);

        if (result.success) {
            setEdges((eds) => addEdge({
                ...params,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5,5' }
            }, eds));
            loadData();
        } else {
            alert("Erro ao conectar: " + result.error);
        }
    }, [setEdges]);

    // Estatísticas
    const stats = {
        totalNodes: nodes.length,
        totalEdges: edges.length
    };

    return (
        <>
            <div className="w-full h-[650px] rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden relative shadow-inner border border-slate-200">
                {/* SVG Gradients */}
                <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                    <defs>
                        <linearGradient id="org-edge-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#94a3b8" />
                            <stop offset="50%" stopColor="#64748b" />
                            <stop offset="100%" stopColor="#475569" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                                <div className="w-14 h-14 border-4 border-blue-100 rounded-full"></div>
                                <div className="absolute inset-0 w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <span className="text-sm font-semibold text-slate-600">Montando hierarquia...</span>
                        </div>
                    </div>
                )}

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    connectionMode={ConnectionMode.Loose}
                    fitView
                    fitViewOptions={{ padding: 0.4 }}
                    minZoom={0.3}
                    maxZoom={1.5}
                    defaultEdgeOptions={{
                        type: 'smoothstep',
                        style: { stroke: '#94a3b8', strokeWidth: 2 },
                        animated: false
                    }}
                >
                    <Background
                        color="#cbd5e1"
                        variant={BackgroundVariant.Dots}
                        gap={40}
                        size={1.5}
                        className="opacity-30"
                    />

                    <Controls
                        className="!bg-white/90 !backdrop-blur-sm !border-slate-200 !shadow-xl !rounded-xl !overflow-hidden"
                        showInteractive={false}
                    />

                    <MiniMap
                        nodeColor={(node: any) => {
                            const dept = node.data?.department || '';
                            if (!node.data?.managerId) return '#1e293b'; // CEO
                            if (dept.includes('Tecnologia')) return '#3b82f6';
                            if (dept.includes('Comercial')) return '#f59e0b';
                            if (dept.includes('RH')) return '#ec4899';
                            if (dept.includes('Financeiro')) return '#64748b';
                            return '#6366f1';
                        }}
                        maskColor="rgba(255, 255, 255, 0.85)"
                        className="!bg-white/90 !backdrop-blur-sm !rounded-xl !border !border-slate-200 !shadow-xl"
                        style={{ width: 140, height: 90 }}
                    />

                    {/* Panel Superior */}
                    <Panel position="top-left" className="!m-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 border border-white/10">
                                <div className="p-1.5 bg-white/10 rounded-lg">
                                    <Building2 className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xs tracking-tight">Organograma</h3>
                                    <p className="text-[9px] text-slate-400">Estrutura hierárquica</p>
                                </div>
                            </div>

                            <div className="flex gap-1.5">
                                <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-lg border border-slate-200 flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                                    <span className="text-xs font-bold text-slate-700">{stats.totalNodes}</span>
                                    <span className="text-[9px] text-slate-400">cargos</span>
                                </div>
                                <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-lg border border-slate-200 flex items-center gap-1.5">
                                    <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-xs font-bold text-slate-700">{stats.totalEdges}</span>
                                    <span className="text-[9px] text-slate-400">vínculos</span>
                                </div>
                            </div>
                        </div>
                    </Panel>

                    {/* Botões - Topo Direito */}
                    <Panel position="top-right" className="!m-3">
                        <div className="flex gap-2">
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => setReportOpen(true)}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg text-xs"
                            >
                                <FileText className="w-3.5 h-3.5 mr-1.5" />
                                Gerar Relatório
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={loadData}
                                disabled={loading}
                                className="bg-white/90 backdrop-blur-sm shadow-lg border-slate-200 hover:bg-white text-xs"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                                Atualizar
                            </Button>
                        </div>
                    </Panel>

                    {/* Legenda Compacta */}
                    <Panel position="bottom-left" className="!m-3">
                        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-xl border border-slate-200 max-w-[280px]">
                            <h4 className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center gap-1.5">
                                <Sparkles className="w-2.5 h-2.5" />
                                Como Usar
                            </h4>
                            <div className="space-y-1.5 text-[10px] text-slate-600">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex-shrink-0" />
                                    <span>Arraste do <strong>ponto verde</strong> para definir subordinação</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-0.5 bg-gradient-to-r from-slate-400 to-slate-600 rounded flex-shrink-0" />
                                    <span><strong>Linhas</strong> conectam chefe → subordinado</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Target className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                    <span>Clique e arraste os <strong>cards</strong> para reorganizar</span>
                                </div>
                            </div>
                        </div>
                    </Panel>
                </ReactFlow>
            </div>

            {/* Modal de Relatório */}
            <OrgReportModal
                isOpen={reportOpen}
                onClose={() => setReportOpen(false)}
                data={{ nodes, edges }}
            />
        </>
    );
}
