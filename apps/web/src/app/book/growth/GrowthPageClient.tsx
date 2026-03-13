'use client';

import { useState } from 'react';
import { GrowthChartClient } from './GrowthChartClient';
import { LogMeasurementModal } from '@/components/book/LogMeasurementModal';
import type { GrowthDataPoint } from '@babybook/shared';

interface Props {
  dataPoints: GrowthDataPoint[];
  isOwner: boolean;
}

export function GrowthPageClient({ dataPoints, isOwner }: Props) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <GrowthChartClient
        dataPoints={dataPoints}
        isOwner={isOwner}
        onLogMeasurement={() => setShowModal(true)}
      />
      {showModal && (
        <LogMeasurementModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
