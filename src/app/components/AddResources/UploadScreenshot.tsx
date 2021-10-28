import { useEffect, useRef, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { writeError } from '../../utils/logs';
import { takeScreenshot } from '../../utils/media';
import { notify } from '../../utils/notifications';
import { classNames } from '../../utils/styles';
import { uploadScreenshot } from './api';
import styles from './UploadScreenshot.module.css';

type UploadScreenshotProps = {
  onUpload: (path?: string) => void;
};
function UploadScreenshot({ onUpload }: UploadScreenshotProps): JSX.Element {
  const user = useUser();
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [timer, setTimer] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !screenshot) {
      return;
    }
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const image = new Image();
    image.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);
    };
    image.src = screenshot;
  }, [canvasRef.current, screenshot]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTimer(null);
    const file = event.target.files![0];
    setScreenshot(URL.createObjectURL(file));
  }

  async function handleUpload() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    if (!screenshot) {
      onUpload();
    } else {
      setIsUploading(true);
      canvas.toBlob(async (blob) => {
        if (!blob) {
          return;
        }
        const result = await notify(uploadScreenshot(blob));
        onUpload(result.screenshotId);
        setIsUploading(false);
      });
    }
  }

  async function handleTakeScreenshot() {
    setTimer(3);
    try {
      const screenshotUrl = await takeScreenshot();
      setScreenshot(screenshotUrl);
    } catch (error) {
      writeError(error);
    }
  }

  useEffect(() => {
    if (timer === null) {
      return;
    }
    let timeout: NodeJS.Timeout | null = null;
    if (timer > 0) {
      timeout = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
    } else {
      (async () => {
        try {
          const screenshotUrl = await takeScreenshot();
          setScreenshot(screenshotUrl);
          setTimer(null);
        } catch (error) {
          writeError(error);
          setTimer(3);
        }
      })();
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [timer]);

  return (
    <div className={styles.container}>
      <div className={styles.preview}>
        <div className={styles.actions}>
          <button
            className={styles.action}
            onClick={handleTakeScreenshot}
            disabled={!user}
          >
            Take screenshot
          </button>
          <span>or</span>
          <label
            className={classNames(styles.action, !user && styles.disabled)}
          >
            Choose file
            <input
              disabled={!user}
              className={styles.hidden}
              type="file"
              onChange={handleChange}
              accept="image/*"
              name="screenshot"
            />
          </label>
        </div>
        <div>
          {timer !== null ? (
            <>Please focus New World. Screenshot in {timer}s</>
          ) : user ? (
            'A screenshot helps other players to find this resource.'
          ) : (
            'Please login to upload a screenshot.'
          )}
        </div>
        <canvas ref={canvasRef} className={styles.screenshot} />
      </div>
      <button
        onClick={handleUpload}
        className={styles.upload}
        disabled={isUploading}
      >
        {!screenshot ? 'Skip screenshot' : 'Save'}
      </button>
    </div>
  );
}

export default UploadScreenshot;
