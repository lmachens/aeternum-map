import { useState } from 'react';
import { useMarkers } from '../../contexts/MarkersContext';
import { useModal } from '../../contexts/ModalContext';
import { useUser } from '../../contexts/UserContext';
import { classNames } from '../../utils/styles';
import type { FilterItem } from '../MapFilter/mapFilters';
import styles from './AddResources.module.css';
import SelectType from './SelectType';
import SelectPosition from './SelectPosition';
import StepIcon from './StepIcon';
import UploadScreenshot from './UploadScreenshot';
import DetailsInput from './DetailsInput';
import { writeError } from '../../utils/logs';
import type { MarkerDTO } from './api';
import { postMarker } from './api';
import { notify } from '../../utils/notifications';

export type Details = {
  description?: string;
  name?: string;
  level?: number;
  levelRange?: [number, number];
};
function AddResources(): JSX.Element {
  const user = useUser();
  const { closeLatestModal } = useModal();
  const { refresh } = useMarkers();
  const [step, setStep] = useState(0);
  const [filter, setFilter] = useState<FilterItem | null>(null);
  const [details, setDetails] = useState<Details | null>(null);
  const [position, setPosition] = useState<[number, number, number] | null>(
    null
  );

  async function handleUploadScreenshot(screenshotId?: string) {
    if (!filter || !position || !user) {
      return;
    }
    try {
      const marker: MarkerDTO = {
        type: filter.type,
        position: position || undefined,
        username: user.username,
        screenshotId,
        ...details,
      };

      await notify(postMarker(marker), {
        success: 'Marker added 👌',
      });

      refresh();
      closeLatestModal();
    } catch (error) {
      writeError(error);
    }
  }

  return (
    <section className={styles.container}>
      <aside className={styles.stepper}>
        <button onClick={() => setStep(0)} className={styles.step}>
          <StepIcon step={1} done={Boolean(filter)} disabled={false} />{' '}
          <span className={classNames(step === 0 && styles.active)}>
            {filter ? filter.title : 'Select type'}
          </span>
        </button>
        <button
          onClick={() => setStep(1)}
          className={styles.step}
          disabled={!filter}
        >
          <StepIcon step={2} done={Boolean(details)} disabled={!filter} />{' '}
          <span className={classNames(step === 1 && styles.active)}>
            Enter details
          </span>
        </button>
        <button
          onClick={() => setStep(2)}
          className={styles.step}
          disabled={!details}
        >
          <StepIcon step={3} done={Boolean(position)} disabled={!details} />{' '}
          <span className={classNames(step === 2 && styles.active)}>
            Set position
          </span>
        </button>
        <button
          onClick={() => setStep(3)}
          className={styles.step}
          disabled={!position}
        >
          <StepIcon step={4} done={false} disabled={!position} />{' '}
          <span className={classNames(step === 3 && styles.active)}>
            Upload screenshot
          </span>
        </button>
      </aside>
      {step === 0 && (
        <SelectType
          onSelect={(filter) => {
            setFilter(filter);
            setPosition(null);
            setStep(1);
          }}
        />
      )}
      {step === 1 && filter && (
        <DetailsInput
          filter={filter}
          onChange={(details) => {
            setDetails(details);
            setStep(2);
          }}
        />
      )}
      {step === 2 && filter && details && (
        <SelectPosition
          details={details}
          filter={filter}
          onSelectPosition={(position) => {
            setPosition(position);
            setStep(3);
          }}
        />
      )}
      {step === 3 && <UploadScreenshot onUpload={handleUploadScreenshot} />}
    </section>
  );
}

export default AddResources;
