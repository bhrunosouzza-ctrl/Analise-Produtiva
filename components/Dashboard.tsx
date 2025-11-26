import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { 
  UploadCloud, BarChart2, Target, Briefcase, Droplet, 
  TrendingUp, Home, Users, AlertTriangle, ClipboardList, PieChart as PieIcon 
} from 'lucide-react';
import { ProductionData, FilterState, GoalSettings } from '../types';
import { processDataFile, calculateAnalytics, COLORS } from '../utils';
import { KpiCard } from './KpiCard';
import { GoalModal } from './GoalModal';

export const Dashboard: React.FC = () => {
    const [rawData, setRawData] = useState<ProductionData[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'quality' | 'property' | 'teams' | 'issues'>('overview');
    const [showGoalModal, setShowGoalModal] = useState(false);

    const [goals, setGoals] = useState<GoalSettings>({
        trabalhados: 1000,
        diariaMin: 20,
        diariaMax: 25,
        eficienciaMin: 80
    });

    const [filters, setFilters] = useState<FilterState>({
        supervisor: 'Todos',
        agente: 'Todos',
        ciclo: 'Todos',
        mes: 'Todos'
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLoading(true);
        try {
            const data = await processDataFile(file);
            setRawData(data);
        } catch (error) {
            console.error("Error processing file", error);
            alert("Error processing file. Please ensure it is a valid Excel/CSV file.");
        } finally {
            setLoading(false);
        }
    };

    const filteredData = useMemo(() => {
        return rawData.filter(item => {
            return (filters.supervisor === 'Todos' || item.Supervisor === filters.supervisor) &&
                   (filters.agente === 'Todos' || item.Agente === filters.agente) &&
                   (filters.ciclo === 'Todos' || item.Ciclo === filters.ciclo) &&
                   (filters.mes === 'Todos' || item.Mes === filters.mes);
        });
    }, [rawData, filters]);

    const analytics = useMemo(() => calculateAnalytics(filteredData, goals), [filteredData, goals]);

    const options = useMemo(() => {
        const getUnique = (key: string) => ['Todos', ...new Set(rawData.map(item => item[key]).filter(Boolean))].sort();
        return {
            supervisores: getUnique('Supervisor'),
            agentes: getUnique('Agente'),
            ciclos: getUnique('Ciclo'),
            meses: getUnique('Mes')
        };
    }, [rawData]);

    const pendenciasList = useMemo(() => {
        return filteredData.filter(d => 
            d.Pendencias && 
            !d.Pendencias.toLowerCase().includes('não houve') && 
            !d.Pendencias.toLowerCase().includes('sem pendência') &&
            d.Pendencias !== '0'
        );
    }, [filteredData]);

    if (rawData.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white border border-gray-200 shadow-xl rounded-2xl p-8 text-center">
                    <div className="mx-auto h-20 w-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                        <UploadCloud size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">Dashboard Produção</h2>
                    <p className="text-gray-500 mb-8">Carregue o arquivo de dados (CSV/Excel) para gerar a análise completa.</p>
                    <label className="block w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                        <span className="flex items-center justify-center gap-2">
                            <UploadCloud size={20} />
                            Selecionar Arquivo
                        </span>
                        <input type="file" className="hidden" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} />
                    </label>
                    {loading && <div className="mt-6 flex justify-center"><div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-6 py-4 shadow-sm/50 backdrop-blur-md bg-white/90">
                <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full xl:w-auto">
                        <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-200">
                            <BarChart2 size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 tracking-tight">ProdAnalytics</h1>
                            <div className="flex gap-4 text-xs text-gray-500 font-medium mt-0.5">
                                <span className="flex items-center gap-1.5"><Target size={14} className="text-blue-500"/> Meta: {goals.trabalhados}</span>
                                <span className="flex items-center gap-1.5"><TrendingUp size={14} className="text-green-500"/> Diária: {goals.diariaMin}-{goals.diariaMax}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full xl:w-auto items-center justify-end">
                        {['Supervisor', 'Agente', 'Ciclo', 'Mes'].map(filterKey => (
                            <div key={filterKey} className="relative">
                                <select 
                                    className="appearance-none bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-8 py-2.5 shadow-sm outline-none transition-all cursor-pointer hover:bg-white"
                                    value={(filters as any)[filterKey.toLowerCase()]}
                                    onChange={(e) => setFilters({...filters, [filterKey.toLowerCase()]: e.target.value})}
                                >
                                    <option value="Todos">{filterKey}: Todos</option>
                                    {(options as any)[filterKey.toLowerCase() === 'supervisor' ? 'supervisores' : filterKey.toLowerCase() === 'mes' ? 'meses' : filterKey.toLowerCase() + 's']?.map((opt: string) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                        ))}
                        <button 
                            onClick={() => setShowGoalModal(true)} 
                            className="p-2.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors border border-transparent hover:border-blue-100" 
                            title="Configurar Metas"
                        >
                            <Target size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                        {[
                            { id: 'overview', label: 'Visão Geral', icon: BarChart2 },
                            { id: 'quality', label: 'Qualidade', icon: Droplet },
                            { id: 'property', label: 'Imóveis', icon: Home },
                            { id: 'teams', label: 'Equipes', icon: Users },
                            { id: 'issues', label: 'Pendências', icon: AlertTriangle, count: pendenciasList.length }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                                    ${activeTab === tab.id 
                                        ? 'border-blue-500 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                `}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className="ml-1.5 py-0.5 px-2 rounded-full text-xs font-medium bg-red-100 text-red-600">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Tab Content: Overview */}
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <KpiCard 
                                title="Trabalhados" 
                                value={analytics.totalTrabalhados.toLocaleString()} 
                                sub={`Meta: ${(analytics.rankingAgentes.length * goals.trabalhados).toLocaleString()}`} 
                                icon={Briefcase} 
                                color="blue" 
                            />
                            <KpiCard 
                                title="Média Diária" 
                                value={analytics.mediaDiaria} 
                                sub={`Alvo: ${goals.diariaMin}-${goals.diariaMax}`} 
                                icon={TrendingUp} 
                                color={parseFloat(analytics.mediaDiaria) >= goals.diariaMin ? 'green' : 'red'} 
                            />
                            <KpiCard 
                                title="Eficiência" 
                                value={`${analytics.percTrabalhados.toFixed(1)}%`} 
                                sub={`Perda: ${analytics.percPerda.toFixed(1)}%`} 
                                icon={PieIcon} 
                                color={analytics.percTrabalhados >= goals.eficienciaMin ? 'green' : 'orange'} 
                            />
                            <KpiCard 
                                title="Imóveis Fechados" 
                                value={analytics.totalFechados.toLocaleString()} 
                                sub={`Recusas: ${analytics.totalRecusas.toLocaleString()}`} 
                                icon={Home} 
                                color="slate" 
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                             {/* Ranking Column */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full">
                                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center backdrop-blur-sm">
                                    <h3 className="font-bold text-gray-800">Ranking Produtividade</h3>
                                    <span className="text-xs font-medium px-2 py-1 bg-gray-200 text-gray-600 rounded">Top Agentes</span>
                                </div>
                                <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
                                    {analytics.rankingAgentes.map((agent, idx) => (
                                        <div key={idx} className="group flex flex-col p-3 hover:bg-blue-50/50 rounded-lg transition-all border border-transparent hover:border-blue-100">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${idx < 3 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-50' : 'bg-slate-100 text-slate-500'}`}>
                                                        {idx + 1}
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-700 truncate max-w-[120px]" title={agent.name}>{agent.name}</span>
                                                </div>
                                                <span className={`text-sm font-bold font-mono ${agent.StatusMeta ? 'text-green-600' : 'text-slate-500'}`}>{agent.Trabalhados}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${agent.StatusMeta ? 'bg-green-500' : 'bg-blue-500'}`} 
                                                    style={{width: `${Math.min(100, (agent.Trabalhados / goals.trabalhados) * 100)}%`}}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between mt-1.5 text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                                                <span>Média: {agent.MediaDiaria}</span>
                                                <span className="group-hover:text-blue-500 transition-colors">Supervisor: {agent.Supervisor.split(' ')[0]}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Chart Column */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2 flex flex-col h-full">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-gray-800 text-lg">Análise de Perda</h3>
                                    <div className="flex gap-4 text-xs font-medium text-gray-500">
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Trabalhados</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span>Fechados</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>Recusas</span>
                                    </div>
                                </div>
                                <div className="flex-1 w-full min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics.rankingAgentes.slice(0, 20)} margin={{top: 10, right: 10, left: 0, bottom: 60}} barSize={20}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b'}} interval={0} angle={-45} textAnchor="end" height={60} />
                                            <YAxis tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
                                            <Tooltip 
                                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                                                cursor={{fill: '#f8fafc'}}
                                            />
                                            <Bar dataKey="Trabalhados" stackId="a" fill={COLORS.blue} radius={[0, 0, 4, 4]} />
                                            <Bar dataKey="Fechados" stackId="a" fill={COLORS.yellow} />
                                            <Bar dataKey="Recusas" stackId="a" fill={COLORS.red} radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content: Quality */}
                {activeTab === 'quality' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <KpiCard title="Imóveis Tratados" value={analytics.totalImTrat.toLocaleString()} sub="Ação Corretiva" icon={Droplet} color="teal" />
                            <KpiCard title="Depósitos Eliminados" value={analytics.totalDepElim.toLocaleString()} sub="Controle Mecânico" icon={Target} color="red" />
                            <KpiCard title="Uso Larvicida (g)" value={analytics.totalLarvicida.toFixed(1)} sub="Controle Químico" icon={ClipboardList} color="purple" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-96">
                                <h3 className="font-bold text-gray-800 text-lg mb-6">Tipos de Depósitos (A1 - E)</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.chartDepositos}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                                        <YAxis tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}/>
                                        <Bar dataKey="value" fill={COLORS.orange} radius={[4,4,0,0]} name="Qtd" barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-96">
                                <h3 className="font-bold text-gray-800 text-lg mb-6">Top Agentes - Tratamento Focal</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[...analytics.rankingAgentes].sort((a,b)=>b.Im_Trat - a.Im_Trat).slice(0, 10)} layout="vertical" margin={{left: 20}}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                        <XAxis type="number" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                                        <YAxis dataKey="name" type="category" width={100} tick={{fontSize:11, fill: '#475569'}} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}/>
                                        <Bar dataKey="Im_Trat" fill={COLORS.teal} radius={[0,4,4,0]} name="Imóveis Tratados" barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content: Property */}
                {activeTab === 'property' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-8 h-[500px] flex flex-col">
                            <h3 className="font-bold text-gray-800 text-lg mb-2">Distribuição por Tipo de Imóvel</h3>
                            <p className="text-sm text-gray-500 mb-6">Visualização da proporção de tipos de imóveis trabalhados no período.</p>
                            <div className="flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={analytics.chartImoveis}
                                            cx="50%" cy="50%"
                                            innerRadius={80} outerRadius={140}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {analytics.chartImoveis.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-800 text-lg mb-6">Detalhes</h3>
                            <div className="space-y-4">
                                {analytics.chartImoveis.map((item, idx) => {
                                    const labels: any = { 'R': 'Residencial', 'Tb': 'Terreno Baldio', 'PE': 'Ponto Estratégico', 'O': 'Outros' };
                                    return (
                                        <div key={item.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 rounded-full shadow-sm" style={{backgroundColor: Object.values(COLORS)[idx % Object.values(COLORS).length]}}></div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-800">{labels[item.name] || item.name}</span>
                                                    <span className="text-xs text-gray-400 font-mono">{item.name}</span>
                                                </div>
                                            </div>
                                            <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded text-sm">{item.value.toLocaleString()}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content: Teams */}
                {activeTab === 'teams' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 animate-in fade-in duration-500">
                        <div className="mb-8">
                            <h3 className="font-bold text-gray-800 text-lg">Comparativo de Produtividade: Supervisores</h3>
                            <p className="text-gray-500">Média de imóveis trabalhados por agente em cada equipe.</p>
                        </div>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.rankingSupervisores} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                                    <YAxis tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        cursor={{fill: '#f8fafc'}}
                                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                                    />
                                    <Bar dataKey="MediaPorAgente" radius={[6,6,0,0]} barSize={60}>
                                        {analytics.rankingSupervisores.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.name === filters.supervisor ? COLORS.orange : COLORS.purple} 
                                                className="transition-all duration-300 hover:opacity-80"
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Tab Content: Issues */}
                {activeTab === 'issues' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
                        <div className="px-6 py-5 border-b border-red-100 bg-red-50 flex justify-between items-center">
                            <h3 className="font-bold text-red-800 flex items-center gap-2">
                                <AlertTriangle size={20} />
                                Ocorrências e Pendências
                            </h3>
                            <span className="bg-white text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                                {pendenciasList.length} Registros
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Data</th>
                                        <th className="px-6 py-4 font-semibold">Agente</th>
                                        <th className="px-6 py-4 font-semibold">Supervisor</th>
                                        <th className="px-6 py-4 font-semibold">Tipo</th>
                                        <th className="px-6 py-4 font-semibold">Observação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pendenciasList.map((row, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium">{row.DataISO.split('-').reverse().join('/')}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{row.Agente}</td>
                                            <td className="px-6 py-4">{row.Supervisor}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-md text-xs font-bold inline-block">
                                                    {row.Pendencias}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 italic text-gray-500 max-w-xs truncate" title={row.Observacao}>
                                                "{row.Observacao}"
                                            </td>
                                        </tr>
                                    ))}
                                    {pendenciasList.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <ClipboardList size={32} className="opacity-20" />
                                                    <p>Nenhuma pendência crítica encontrada nos dados filtrados.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            <GoalModal 
                isOpen={showGoalModal} 
                onClose={() => setShowGoalModal(false)} 
                goals={goals} 
                setGoals={setGoals} 
            />
        </div>
    );
};