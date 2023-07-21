import { BrowserRouter, Routes, Route} from 'react-router-dom'
import { Login } from '../pages/Login';
import { Home } from '../pages/Home';
import { PrivateRoutes } from '.';
import { Fragment } from 'react';

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Fragment>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/home" element={<PrivateRoutes />}>
                        <Route path="/home" element={<Home />} />
                    </Route>
                </Routes>
            </Fragment>
        </BrowserRouter>
    )
};