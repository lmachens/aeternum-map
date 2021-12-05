import '../globals.css';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import AppHeader from '../components/AppHeader/AppHeader';
import { SettingsProvider } from '../contexts/SettingsContext';
import { useAccount, UserProvider } from '../contexts/UserContext';
import { waitForOverwolf } from '../utils/overwolf';
import styles from './Sender.module.css';
import Ads from '../components/Ads/Ads';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Welcome from './Welcome';
import Streaming from './Streaming';

function Sender(): JSX.Element {
  const { account } = useAccount();

  return (
    <div className={styles.container}>
      <AppHeader />
      <main className={styles.main}>
        {account ? <Streaming /> : <Welcome />}
      </main>
      <Ads active />
      <ToastContainer
        theme="dark"
        pauseOnHover={false}
        autoClose={3000}
        pauseOnFocusLoss={false}
        style={{ marginTop: 32 }}
      />
    </div>
  );
}

waitForOverwolf().then(() => {
  ReactDOM.render(
    <StrictMode>
      <SettingsProvider>
        <UserProvider>
          <Sender />
        </UserProvider>
      </SettingsProvider>
    </StrictMode>,
    document.querySelector('#root')
  );
});