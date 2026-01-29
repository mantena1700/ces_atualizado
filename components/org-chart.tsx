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
    ArrowDown, Sparkles, Target, GitBranch
} from 'lucide-react';
import { Button } from './ui/button';

// Registra os tipos de nós customizados
const nodeTypes = {
    orgNode: OrgNode,
};

export function OrgChart() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);

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
                    strokeWidth: 3,
                    strokeLinecap: 'round'
                },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: '#64748b',
                    width: 16,
                    height: 16
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
                style: { stroke: '#10b981', strokeWidth: 3, strokeDasharray: '5,5' }
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
        <div className="w-full h-[700px] rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden relative shadow-inner border border-slate-200">
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
                            <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                            <div className="absolute inset-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
                fitViewOptions={{ padding: 0.3 }}
                minZoom={0.2}
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
                    size={2}
                    className="opacity-40"
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
                    style={{ width: 160, height: 110 }}
                />

                {/* Panel Superior */}
                <Panel position="top-left" className="!m-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
                            <div className="p-2 bg-white/10 rounded-xl">
                                <Building2 className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-tight">Organograma</h3>
                                <p className="text-[10px] text-slate-400">Estrutura hierárquica</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-slate-200 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-bold text-slate-700">{stats.totalNodes}</span>
                                <span className="text-[10px] text-slate-400">cargos</span>
                            </div>
                            <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-slate-200 flex items-center gap-2">
                                <ArrowDown className="w-4 h-4 text-emerald-600" />
                                <span className="text-xs font-bold text-slate-700">{stats.totalEdges}</span>
                                <span className="text-[10px] text-slate-400">vínculos</span>
                            </div>
                        </div>
                    </div>
                </Panel>

                {/* Botão de Atualizar */}
                <Panel position="top-right" className="!m-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadData}
                        disabled={loading}
                        className="bg-white/90 backdrop-blur-sm shadow-lg border-slate-200 hover:bg-white"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Atualizar
                    </Button>
                </Panel>

                {/* Legenda */}
                <Panel position="bottom-left" className="!m-4">
                    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-slate-200 max-w-xs">
                        <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            Como Usar
                        </h4>
                        <div className="space-y-2 text-xs text-slate-600">
                            <div className="flex items-start gap-2">
                                <div className="w-4 h-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex-shrink-0 mt-0.5" />
                                <span>Arraste do <strong>ponto verde</strong> para definir subordinação</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-4 h-1 bg-gradient-to-r from-slate-400 to-slate-600 rounded flex-shrink-0 mt-1.5" />
                                <span><strong>Linhas</strong> conectam chefe → subordinado</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <Target className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                <span>Clique e arraste os <strong>cards</strong> para reorganizar</span>
                            </div>
                        </div>
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
}
