import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface Props {
    allowedRoles: string[]; // Ushbu yo'nalishga ruxsat berilgan rollar ro'yxati
}

const ProtectedRoute = ({ allowedRoles }: Props) => {
    const location = useLocation();

    // 1. Ma'lumotlarni localStorage'dan olamiz
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('role');

    // 2. Agar foydalanuvchi tizimga kirmagan bo'lsa (token yo'q bo'lsa)
    if (!token) {
        // Uni login sahifasiga yuboramiz va qaysi sahifadan kelganini eslab qolamiz (state)
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Agar foydalanuvchining roli ruxsat etilganlar ro'yxatida bo'lmasa
    if (!allowedRoles.includes(userRole || '')) {
        // Uni "ruxsat etilmagan" sahifasiga yuboramiz
        return <Navigate to="/unauthorized" replace />;
    }

    // 4. Hamma shartlar to'g'ri bo'lsa, ichki sahifani (children/Outlet) ko'rsatamiz
    return <Outlet />;
};

export default ProtectedRoute;