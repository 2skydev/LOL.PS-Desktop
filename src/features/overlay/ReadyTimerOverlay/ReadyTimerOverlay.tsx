import { useEffect, useState } from 'react';

import clsx from 'clsx';

import { AutoAcceptData } from '@app/types';

import { ReadyTimerOverlayStyled } from './styled';

export interface ReadyTimerOverlayProps {
  className?: string;
}

const ReadyTimerOverlay = ({ className }: ReadyTimerOverlayProps) => {
  const [data, setData] = useState<AutoAcceptData | null>(null);

  useEffect(() => {
    window.electron.subscribeLeague('league/auto-accept', (data: AutoAcceptData) => {
      if (data.playerResponse === 'None') {
        setData(data);
      } else {
        setData(null);
      }
    });

    return () => {
      window.electron.unsubscribeLeague('league/auto-accept');
    };
  }, []);

  if (!data) return null;

  return (
    <ReadyTimerOverlayStyled className={clsx('ReadyTimerOverlay', className)}>
      자동 수락까지 {data.autoAcceptDelaySeconds! - data.timer!}초 남았습니다
    </ReadyTimerOverlayStyled>
  );
};

export default ReadyTimerOverlay;
