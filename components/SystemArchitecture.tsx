import React, { useState, useMemo } from 'react';
import { SYSTEM_COMPONENTS, CONNECTIONS, ICONS } from '../constants';
import type { SystemComponent } from '../types';
import Card from './common/Card';
import Modal from './common/Modal';

const strokeColorMapping: Record<string, string> = {
    'DICOM': 'stroke-brand-subtle',
    'HL7': 'stroke-brand-subtle',
    'API': 'stroke-brand-subtle',
    'HTTPS': 'stroke-brand-subtle',
};

const fillColorMapping: Record<string, string> = {
    'DICOM': 'fill-brand-subtle',
    'HL7': 'fill-brand-subtle',
    'API': 'fill-brand-subtle',
    'HTTPS': 'fill-brand-subtle',
};


const SystemArchitecture = () => {
    const [selectedComponent, setSelectedComponent] = useState<SystemComponent | null>(null);

    const getComponentById = (id: string) => SYSTEM_COMPONENTS.find(c => c.id === id);

    const legendItems = useMemo(() => [
        { label: 'DICOM', icon: ICONS['DICOM'] },
        { label: 'HL7', icon: ICONS['HL7'] },
        { label: 'API/HTTPS', icon: ICONS['API'] },
    ], []);

    return (
        <div>
            <div className="relative w-full h-[600px] bg-brand-bg rounded-lg border border-brand-surface p-4 overflow-hidden">
                <svg width="100%" height="100%" className="absolute top-0 left-0 pointer-events-none">
                    <defs>
                        {CONNECTIONS.map((conn, index) => {
                             const colorClass = fillColorMapping[conn.label] || 'fill-gray-400';
                            return (
                                <marker 
                                    key={index}
                                    id={`arrow-${conn.from}-${conn.to}`} 
                                    viewBox="0 0 10 10" 
                                    refX="9" 
                                    refY="5" 
                                    markerWidth="6" 
                                    markerHeight="6" 
                                    orient="auto-start-reverse"
                                >
                                    <path d="M 0 0 L 10 5 L 0 10 z" className={`${colorClass} opacity-50`} />
                                </marker>
                            );
                        })}
                    </defs>
                    {CONNECTIONS.map((conn, index) => {
                        const from = getComponentById(conn.from);
                        const to = getComponentById(conn.to);
                        if (!from || !to) return null;

                        const fromPos = { x: parseFloat(from.position.left), y: parseFloat(from.position.top) };
                        const toPos = { x: parseFloat(to.position.left), y: parseFloat(to.position.top) };

                        const dx = toPos.x - fromPos.x;
                        const dy = toPos.y - fromPos.y;
                        const angle = Math.atan2(dy, dx);
                        
                        // Approximate card dimensions in percentage to calculate offsets
                        const cardWidthPercent = 15;
                        const cardHeightPercent = 18;
                        
                        const offsetX = Math.cos(angle) * cardWidthPercent * 0.55;
                        const offsetY = Math.sin(angle) * cardHeightPercent * 0.55;

                        const adjustedToX = toPos.x - offsetX;
                        const adjustedToY = toPos.y - offsetY;

                        const strokeClass = strokeColorMapping[conn.label] || 'stroke-gray-400';

                        return (
                            <line
                                key={index}
                                x1={`${fromPos.x}%`} y1={`${fromPos.y}%`}
                                x2={`${adjustedToX}%`} y2={`${adjustedToY}%`}
                                className={`${strokeClass} opacity-40`}
                                strokeWidth="2"
                                markerEnd={`url(#arrow-${conn.from}-${conn.to})`}
                            />
                        )
                    })}
                </svg>

                {CONNECTIONS.map((conn, index) => {
                    const from = getComponentById(conn.from);
                    const to = getComponentById(conn.to);
                    if (!from || !to) return null;

                    const fromPos = { x: parseFloat(from.position.left), y: parseFloat(from.position.top) };
                    const toPos = { x: parseFloat(to.position.left), y: parseFloat(to.position.top) };

                    const midX = fromPos.x + (toPos.x - fromPos.x) / 2;
                    const midY = fromPos.y + (toPos.y - fromPos.y) / 2;
                    
                    return (
                        <div key={`label-${index}`} className="absolute p-1 bg-brand-bg rounded-md flex items-center space-x-1" style={{ top: `${midY}%`, left: `${midX}%`, transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
                           {React.cloneElement(ICONS[conn.label], { className: 'w-4 h-4 text-brand-subtle' })}
                           <span className="text-xs font-semibold text-brand-subtle">{conn.label}</span>
                        </div>
                    )
                })}


                {SYSTEM_COMPONENTS.map(comp => (
                    <div
                        key={comp.id}
                        className="absolute w-40 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                        style={{ top: comp.position.top, left: comp.position.left }}
                        onClick={() => setSelectedComponent(comp)}
                    >
                        <Card className="group-hover:border-brand-accent group-hover:shadow-lg transition-all text-center">
                            <div className="flex flex-col items-center">
                                <div className="p-2 mb-2">
                                    {React.cloneElement(ICONS.SYSTEM, { className: `w-8 h-8 ${comp.colorClass}` })}
                                </div>
                                <h3 className="font-bold text-sm text-brand-accent">{comp.name}</h3>
                                <p className="text-xs text-brand-subtle mt-1">{comp.description}</p>
                            </div>
                        </Card>
                    </div>
                ))}
                
                <div className="absolute bottom-4 right-4 bg-brand-surface rounded-lg p-3 border border-brand-subtle/10 shadow-sm">
                    <h4 className="font-bold text-sm mb-2 text-brand-text">Legend</h4>
                    <div className="space-y-2">
                        {legendItems.map(item => (
                            <div key={item.label} className="flex items-center space-x-2">
                                {React.cloneElement(item.icon, { className: 'w-5 h-5' })}
                                <span className={`text-xs font-medium text-brand-subtle`}>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {selectedComponent && (
                <Modal title={selectedComponent.name} onClose={() => setSelectedComponent(null)}>
                    <p className="text-brand-subtle mb-4">{selectedComponent.description}</p>
                    <ul className="list-disc list-inside space-y-2 text-brand-text">
                        {selectedComponent.details.map((detail, index) => (
                            <li key={index}>{detail}</li>
                        ))}
                    </ul>
                </Modal>
            )}
        </div>
    );
};

export default SystemArchitecture;