'use client';

import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    MarkerType,
    ConnectionMode,
    Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { createConnection, deleteConnection, updateConnection, updateNodePosition } from '@/app/actions/career';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    X, Save, Trash2, GitBranch, Maximize2, ZoomIn, ZoomOut,
    Target, ArrowUpRight, Sparkles, Layers
} from 'lucide-react';
import JobNode from './career-node';

interface CareerMapProps {
    initialNodes: any[];
    initialEdges: any[];
}

export default function CareerMap({ initialNodes, initialEdges }: CareerMapProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

    // Registrar o tipo de nó Customizado
    const nodeTypes = useMemo(() => ({ jobNode: JobNode }), []);

    // Preparar edges com estilo premium
    const styledEdges = useMemo(() => initialEdges.map(e => ({
        ...e,
        type: 'smoothstep',
        animated: true,
        style: {
            stroke: 'url(#edge-gradient)',
            strokeWidth: 3,
            strokeLinecap: 'round' as const
        },
        labelStyle: {
            fill: '#1e293b',
            fontWeight: 700,
            fontSize: 11,
            textShadow: '0 1px 2px rgba(255,255,255,0.8)'
        },
        labelBgStyle: {
            fill: '#ffffff',
            stroke: '#e2e8f0',
            strokeWidth: 1.5,
            rx: 8,
            ry: 8,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
        },
        labelBgPadding: [10, 6] as [number, number],
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#10b981'
        }
    })), [initialEdges]);

    const [edges, setEdges, onEdgesChange] = useEdgesState(styledEdges);

    // Modal state
    const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
    const [reqInput, setReqInput] = useState('');
    const [loading, setLoading] = useState(false);

    // FUNÇÃO PARA SALVAR POSIÇÃO AO TERMINAR DE ARRASTAR
    const onNodeDragStop = useCallback(async (_event: any, node: any) => {
        await updateNodePosition(node.id, node.position.x, node.position.y);
    }, []);

    const onConnect = useCallback(async (params: Connection) => {
        const tempId = `temp_${Date.now()}`;
        const newEdge = {
            ...params,
            id: tempId,
            animated: true,
            type: 'smoothstep',
            label: '+ Nova Trilha',
            style: { stroke: '#10b981', strokeWidth: 3, strokeDasharray: '5,5' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981', width: 20, height: 20 }
        };
        setEdges((eds) => addEdge(newEdge, eds));

        setSelectedEdge(newEdge as unknown as Edge);
        setReqInput("Promoção");

        if (params.source && params.target) {
            const result = await createConnection(params.source, params.target);
            if (!result.success) {
                alert(`Erro: ${result.error}`);
                setEdges((eds) => eds.filter(e => e.id !== tempId));
                setSelectedEdge(null);
            } else {
                setEdges((eds) => eds.map(e => e.id === tempId ? {
                    ...e,
                    id: result.id!,
                    label: 'Promoção',
                    style: { stroke: 'url(#edge-gradient)', strokeWidth: 3 },
                    animated: true
                } : e));
                setSelectedEdge(prev => prev && prev.id === tempId ? { ...prev, id: result.id! } : prev);
            }
        }
    }, [setEdges]);

    const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
        event.stopPropagation();
        setSelectedEdge(edge);
        setReqInput(edge.label as string || '');
    }, []);

    const handleSaveEdge = async () => {
        if (!selectedEdge) return;
        setLoading(true);
        const result = await updateConnection(selectedEdge.id, reqInput);
        setLoading(false);

        if (result.success) {
            setEdges((eds) => eds.map(e => e.id === selectedEdge.id ? { ...e, label: reqInput } : e));
            setSelectedEdge(null);
        } else {
            alert("Erro ao salvar");
        }
    };

    const handleDeleteEdge = async () => {
        if (!selectedEdge) return;
        if (!confirm("Remover esta conexão permanentemente?")) return;
        setLoading(true);
        const result = await deleteConnection(selectedEdge.id);
        setLoading(false);
        if (result.success) {
            setEdges((eds) => eds.filter(e => e.id !== selectedEdge.id));
            setSelectedEdge(null);
        } else {
            alert("Erro ao deletar");
        }
    };

    // Estatísticas do mapa
    const stats = useMemo(() => ({
        totalNodes: nodes.length,
        totalEdges: edges.length,
        departments: [...new Set(nodes.map(n => n.data?.department).filter(Boolean))].length
    }), [nodes, edges]);

    return (
        <div className="w-full h-full relative">
            {/* SVG Gradients Definition */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="50%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                    <linearGradient id="edge-gradient-selected" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f43f5e" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                </defs>
            </svg>

            <ReactFlow
                nodes={nodes}
                edges={edges.map(e => ({
                    ...e,
                    style: {
                        ...e.style,
                        stroke: selectedEdge?.id === e.id ? 'url(#edge-gradient-selected)' : 'url(#edge-gradient)',
                        strokeWidth: selectedEdge?.id === e.id ? 4 : 3,
                        cursor: 'pointer',
                        filter: selectedEdge?.id === e.id ? 'drop-shadow(0 0 8px rgba(244,63,94,0.5))' : 'none'
                    },
                    animated: true,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: selectedEdge?.id === e.id ? '#f43f5e' : '#10b981',
                        width: 20,
                        height: 20
                    }
                }))}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onEdgeClick={onEdgeClick}
                onNodeDragStop={onNodeDragStop}
                connectionMode={ConnectionMode.Loose}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                snapToGrid
                snapGrid={[25, 25]}
                minZoom={0.3}
                maxZoom={2}
                className="bg-gradient-to-br from-slate-50 via-white to-emerald-50/30"
            >
                {/* Background Premium */}
                <Background
                    color="#cbd5e1"
                    gap={50}
                    size={2}
                    variant={"dots" as any}
                    className="opacity-40"
                />

                {/* MiniMap Premium */}
                <MiniMap
                    nodeColor={(node) => {
                        const dept = node.data?.department || '';
                        if (dept.includes('Tecnologia')) return '#3b82f6';
                        if (dept.includes('Administrativo')) return '#10b981';
                        if (dept.includes('Comercial')) return '#f59e0b';
                        if (dept.includes('Financeiro')) return '#64748b';
                        if (dept.includes('RH')) return '#ec4899';
                        return '#6366f1';
                    }}
                    maskColor="rgba(255, 255, 255, 0.8)"
                    className="!bg-white/90 !backdrop-blur-sm !rounded-xl !border !border-slate-200 !shadow-xl"
                    style={{ width: 150, height: 100 }}
                />

                {/* Controls Premium */}
                <Controls
                    className="!bg-white/90 !backdrop-blur-sm !border-slate-200 !shadow-xl !rounded-xl !overflow-hidden"
                    showInteractive={false}
                />

                {/* Panel Superior - Título e Stats */}
                <Panel position="top-left" className="!m-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
                            <div className="p-2 bg-white/10 rounded-xl">
                                <GitBranch className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-tight">Arquitetura de Carreira</h3>
                                <p className="text-[10px] text-slate-400">Arraste para conectar cargos</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-slate-200 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-bold text-slate-700">{stats.totalNodes}</span>
                                <span className="text-[10px] text-slate-400">cargos</span>
                            </div>
                            <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-slate-200 flex items-center gap-2">
                                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                                <span className="text-xs font-bold text-slate-700">{stats.totalEdges}</span>
                                <span className="text-[10px] text-slate-400">trilhas</span>
                            </div>
                        </div>
                    </div>
                </Panel>

                {/* Panel Inferior - Legenda */}
                <Panel position="bottom-left" className="!m-4">
                    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-slate-200 max-w-xs">
                        <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            Como Usar
                        </h4>
                        <div className="space-y-2 text-xs text-slate-600">
                            <div className="flex items-start gap-2">
                                <div className="w-4 h-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex-shrink-0 mt-0.5" />
                                <span>Arraste do <strong>ponto verde</strong> para criar trilhas</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 rounded flex-shrink-0 mt-0.5" />
                                <span>Clique nas <strong>linhas</strong> para editar</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <Target className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                <span>Arraste os <strong>cargos</strong> para organizar</span>
                            </div>
                        </div>
                    </div>
                </Panel>
            </ReactFlow>

            {/* Modal de Edição de Conexão */}
            {selectedEdge && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setSelectedEdge(null)}
                >
                    <div
                        className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-200 w-96 space-y-5 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white">
                                    <ArrowUpRight className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Editar Trilha</h3>
                                    <p className="text-xs text-slate-400">Configure o caminho de promoção</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedEdge(null)}
                                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Conteúdo */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Tipo de Progressão
                                </Label>
                                <Input
                                    value={reqInput}
                                    onChange={e => setReqInput(e.target.value)}
                                    placeholder="Ex: Promoção Vertical, Movimentação Lateral..."
                                    className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                    autoFocus
                                />
                            </div>

                            {/* Sugestões Rápidas */}
                            <div className="flex flex-wrap gap-2">
                                {['Promoção', 'Promoção Vertical', 'Movimentação Lateral', 'Especialização'].map(suggestion => (
                                    <button
                                        key={suggestion}
                                        onClick={() => setReqInput(suggestion)}
                                        className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 rounded-full transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Ações */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                className="flex-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                                onClick={handleDeleteEdge}
                                disabled={loading}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remover
                            </Button>
                            <Button
                                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
                                onClick={handleSaveEdge}
                                disabled={loading}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Salvar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
