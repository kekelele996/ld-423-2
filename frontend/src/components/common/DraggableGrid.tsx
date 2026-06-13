import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';
import { ChartConfig, Report } from '../../types';
import { ChartPreview } from './ChartPreview';
import { useDatasetStore } from '../../stores/datasetStore';

interface DraggableGridProps {
  report: Report;
  charts: ChartConfig[];
  onAddChart: (chartId: string) => void;
}

const DraggableChart = ({ chart }: { chart: ChartConfig }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: chart.id });
  return (
    <button
      ref={setNodeRef}
      className="draggable-chart"
      style={{ transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined }}
      {...listeners}
      {...attributes}
    >
      {chart.name}
    </button>
  );
};

const DropCanvas = ({ children }: { children: ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'report-canvas' });
  return (
    <section ref={setNodeRef} className={isOver ? 'report-canvas is-over' : 'report-canvas'}>
      {children}
    </section>
  );
};

export const DraggableGrid = ({ report, charts, onAddChart }: DraggableGridProps) => {
  const datasets = useDatasetStore((state) => state.datasets);
  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over?.id === 'report-canvas') onAddChart(String(event.active.id));
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="report-layout">
        <aside className="chart-tray">
          {charts.map((chart) => (
            <DraggableChart key={chart.id} chart={chart} />
          ))}
        </aside>
        <DropCanvas>
          {report.chartIds.map((chartId) => {
            const chart = charts.find((candidate) => candidate.id === chartId);
            const dataset = datasets.find((candidate) => candidate.id === chart?.datasetId);
            return (
              <article key={chartId} className="report-tile">
                <ChartPreview dataset={dataset} config={chart} compact />
              </article>
            );
          })}
        </DropCanvas>
      </div>
    </DndContext>
  );
};
