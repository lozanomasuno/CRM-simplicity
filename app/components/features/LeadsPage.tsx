"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Target, UserCheck, Handshake, CheckCircle } from 'lucide-react';
import { useLeadsStore, Lead, EstadoLead } from '@/store/leadsStore';
import { leadSeeds } from '@/data/seeds';
import TablaLeads from './leads/TablaLeads';
import { ModalLead } from './leads/ModalLead';
import { ModalDetalleLead } from './leads/ModalDetalleLead';
import { AlertasLeads } from './leads/AlertasLeads';
import { ModalActividad } from './actividades/ModalActividad';

const ESTADO_STATS: {
  estado: EstadoLead;
  label: string;
  icon: React.ReactNode;
  iconColor: string;
}[] = [
  { estado: 'nuevo',      label: 'Nuevos',      icon: <Target size={20} />,      iconColor: 'text-blue-500'         },
  { estado: 'contactado', label: 'Contactados', icon: <UserCheck size={20} />,   iconColor: 'text-yellow-500'       },
  { estado: 'interesado', label: 'Interesados', icon: <Handshake size={20} />,   iconColor: 'text-neon-green-light' },
  { estado: 'cerrado',    label: 'Cerrados',    icon: <CheckCircle size={20} />, iconColor: 'text-gray-500'         },
];

const LeadsPage = () => {
  const leads = useLeadsStore((state) => state.leads);
  const seedIfEmpty = useLeadsStore((state) => state.seedIfEmpty);

  useEffect(() => { seedIfEmpty(leadSeeds); }, [seedIfEmpty]);

  const [isModalLeadOpen, setIsModalLeadOpen] = useState(false);
  const [isDetalleOpen,   setIsDetalleOpen]   = useState(false);
  const [selectedLead,    setSelectedLead]    = useState<Lead | null>(null);
  const [leadEditar,      setLeadEditar]      = useState<Lead | undefined>(undefined);
  const [isActividadOpen, setIsActividadOpen] = useState(false);
  const [leadParaActividad, setLeadParaActividad] = useState<string | undefined>(undefined);

  const leadsInactivosSet = React.useMemo(() => {
    const limite = new Date();
    limite.setDate(limite.getDate() - 3);
    return new Set(
      leads
        .filter((l) => {
          if (l.estado === 'cerrado') return false;
          const ref = l.ultimaActividad ?? l.createdAt;
          return new Date(ref) < limite;
        })
        .map((l) => l.id)
    );
  }, [leads]);

  const handleVerDetalle = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetalleOpen(true);
  };

  const handleEditar = (lead: Lead) => {
    setLeadEditar(lead);
    setIsModalLeadOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalLeadOpen(false);
    setLeadEditar(undefined);
  };

  const handleProgramar = (lead: Lead) => {
    setLeadParaActividad(lead.id);
    setIsActividadOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">CRM · Leads</h1>
          <p className="text-gray-500 text-sm">Gestiona y da seguimiento a tus prospectos.</p>
        </div>
        <button
          onClick={() => { setLeadEditar(undefined); setIsModalLeadOpen(true); }}
          className="flex items-center gap-2 bg-neon-green-light text-mouse-gray px-6 py-3 rounded-xl font-black shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:scale-105 transition-all hover:cursor-pointer"
        >
          <Plus size={20} />
          Nuevo Lead
        </button>
      </div>

      {/* Métricas por estado */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {ESTADO_STATS.map(({ estado, label, icon, iconColor }) => {
          const count = leads.filter((l) => l.estado === estado).length;
          return (
            <div
              key={estado}
              className="bg-white dark:bg-mouse-gray rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm"
            >
              <p className="text-xs font-bold text-gray-400 uppercase">{label}</p>
              <p className="mt-1 text-3xl font-black text-gray-900 dark:text-white">{count}</p>
              <div className={`mt-3 flex items-center gap-1 ${iconColor}`}>
                {icon}
                <span className="text-xs font-medium">leads</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TablaLeads
            leads={leads}
            onVerDetalle={handleVerDetalle}
            onEditar={handleEditar}
            leadsInactivos={leadsInactivosSet}
            onProgramar={handleProgramar}
          />
        </div>
        <div>
          <AlertasLeads />
        </div>
      </div>

      <ModalLead
        isOpen={isModalLeadOpen}
        onClose={handleCloseModal}
        lead={leadEditar}
      />
      <ModalDetalleLead
        isOpen={isDetalleOpen}
        onClose={() => { setIsDetalleOpen(false); setSelectedLead(null); }}
        lead={selectedLead}
      />
      <ModalActividad
        isOpen={isActividadOpen}
        onClose={() => { setIsActividadOpen(false); setLeadParaActividad(undefined); }}
        initialLeadId={leadParaActividad}
      />
    </div>
  );
};

export default LeadsPage;
