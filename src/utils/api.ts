const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const getTokens = () => ({
    access: localStorage.getItem("access_token"),
    refresh: localStorage.getItem("refresh_token"),
});

const getFullUrl = (endpoint: string) => {
    const cleanBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

    // Django API'lar odatda oxirida slash bo'lishini talab qiladi
    if (!cleanEndpoint.endsWith('/') && !cleanEndpoint.includes('.')) {
        cleanEndpoint += '/';
    }

    return `${cleanBase}/${cleanEndpoint}`;
};

// 1. Standart JSON so'rovlar uchun (Login, Get data va h.k.)
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const { access } = getTokens();
    const fullUrl = getFullUrl(endpoint);

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(access && { Authorization: `Bearer ${access}` }),
        ...options.headers,
    };

    const response = await fetch(fullUrl, { ...options, headers });

    if (response.status === 401) {
        localStorage.clear();
        if (window.location.pathname !== '/login') window.location.href = "/login";
        throw new Error("Sessiya muddati tugadi");
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || "Xatolik yuz berdi");
    }

    return response.json();
};

// 2. Fayl yuklash uchun (TS xatosini yo'qotadigan qism)
export const apiUpload = async (endpoint: string, formData: FormData) => {
    const { access } = getTokens();
    const fullUrl = getFullUrl(endpoint);

    const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
            ...(access && { Authorization: `Bearer ${access}` }),
            // DIQQAT: FormData ishlatilganda Content-Type yozilmaydi!
        },
        body: formData,
    });

    if (response.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        throw new Error("Sessiya muddati tugadi");
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || "Fayl yuklashda xatolik");
    }

    return response.json();
};