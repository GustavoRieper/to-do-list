import { AuthGoogleProvider } from "./contexts/authGoogle";
import { AppRoutes } from "./routes/routes";
import './style/global.scss';

export const App = () => {
    return (
        <AuthGoogleProvider>
            <AppRoutes />
        </AuthGoogleProvider>
    )
};

