import React, { memo, useMemo } from 'react';
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { DataMigratorPrismaModelPrediction, DataMigratorPrismaField } from '../../DataMigratorPanel.types';
import { dataMigratorStyles as styles } from '../../DataMigratorPanel.web.styles';
import { tokens } from '../../../../../../../SharedTool/style/tokens.shared.style';

interface ModelNodeData {
  modelName: string;
  tableName: string;
  fields: DataMigratorPrismaField[];
}

const ModelNode = memo(({ data }: NodeProps<Node<ModelNodeData>>) => {
  const fkFields = useMemo(() => {
    const fks = new Set<string>();
    data.fields.forEach(f => {
      if (f.relation?.fields) {
        f.relation.fields.forEach(fieldName => fks.add(fieldName));
      }
    });
    return fks;
  }, [data.fields]);

  return (
    <div style={{
      background: '#0a1626',
      border: `1px solid ${tokens.colors.accentBlue}66`,
      borderRadius: '12px',
      padding: '0',
      width: '240px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
    }}>
      <div style={{
        background: tokens.colors.accentBlue + '1a',
        padding: '10px 14px',
        borderBottom: `1px solid ${tokens.colors.accentBlue}33`,
      }}>
        <div style={{ fontSize: '10px', fontWeight: 900, color: tokens.colors.accentBlue, textTransform: 'uppercase', letterSpacing: '1px' }}>Modelo</div>
        <div style={{ fontSize: '14px', fontWeight: 900, color: '#fff' }}>{data.modelName}</div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Tabla: {data.tableName}</div>
      </div>
      <div style={{ padding: '8px 0' }}>
        {data.fields.map((field) => {
          const isId = field.isId || field.name === 'id';
          const isFk = fkFields.has(field.name);
          const isRelation = !!field.relation;
          
          if (isRelation) return null; // Hide virtual relation fields

          return (
            <div key={field.name} style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '4px 14px',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.8)',
              minHeight: '24px',
            }}>
              <Handle 
                type="target" 
                position={Position.Left} 
                id={`target-${field.name}`} 
                style={{ left: '-4px', width: '8px', height: '8px', background: tokens.colors.accentTeal, border: 'none' }} 
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isId && <span style={{ color: tokens.colors.accentOrange, fontWeight: 900 }}>PK</span>}
                {isFk && <span style={{ color: tokens.colors.accentTeal, fontWeight: 900 }}>FK</span>}
                <span>{field.name}</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>{field.prismaType}</div>
              <Handle 
                type="source" 
                position={Position.Right} 
                id={`source-${field.name}`} 
                style={{ right: '-4px', width: '8px', height: '8px', background: tokens.colors.accentTeal, border: 'none' }} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

ModelNode.displayName = 'ModelNode';

const nodeTypes = { model: ModelNode };

interface PrismaERDiagramProps {
  models: DataMigratorPrismaModelPrediction[];
}

export const PrismaERDiagram: React.FC<PrismaERDiagramProps> = memo(({ models }) => {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node<ModelNodeData>[] = models.map((model, index) => ({
      id: model.modelName,
      type: 'model',
      position: { x: (index % 3) * 350, y: Math.floor(index / 3) * 400 },
      data: {
        modelName: model.modelName,
        tableName: model.tableName,
        fields: model.fields,
      },
    }));

    const edges: Edge[] = [];
    models.forEach((model) => {
      model.fields.forEach((field) => {
        if (field.relation) {
          // Connect local fields to remote references
          field.relation.fields.forEach((localField, idx) => {
            const remoteField = field.relation?.references[idx];
            if (remoteField) {
              edges.push({
                id: `edge-${model.modelName}-${localField}-${field.relation?.to}-${remoteField}`,
                source: model.modelName,
                sourceHandle: `source-${localField}`,
                target: field.relation?.to || '',
                targetHandle: `target-${remoteField}`,
                animated: true,
                style: { stroke: tokens.colors.accentTeal, strokeWidth: 2 },
              });
            }
          });
        }
      });
    });

    return { nodes, edges };
  }, [models]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '600px', background: '#080d14', borderRadius: '16px', overflow: 'hidden' }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background color="rgba(255,255,255,0.05)" gap={20} />
          <Controls />
          <MiniMap 
            style={{ background: '#0a1626', border: '1px solid rgba(255,255,255,0.1)' }}
            nodeStrokeColor={(n) => tokens.colors.accentBlue}
            nodeColor={(n) => '#0a1626'}
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
});

PrismaERDiagram.displayName = 'PrismaERDiagram';
