// utils/api.ts
const BASE_URL = import.meta.env.VITE_API_URL;

export const getTokens = () => ({
    access: localStorage.getItem("access_token"),
    refresh: localStorage.getItem("refresh_token"),
});

// URL ni tozalash uchun yordamchi funksiya
const getFullUrl = (endpoint: string) => {
    const cleanBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // Agar endpoint oxirida slash bo'lmasa va u fayl bo'lmasa, slash qo'shish (Django uchun muhim)
    if (!cleanEndpoint.endsWith('/') && !cleanEndpoint.includes('.')) {
        cleanEndpoint += '/';
    }

    return `${cleanBase}${cleanEndpoint}`;
};
// 1. Oddiy JSON so'rovlar uchun (GET, POST, DELETE, PUT)
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
        window.location.href = "/login";
        throw new Error("Sessiya muddati tugadi");
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Xatolik yuz berdi");
    }

    return response.json();
};

// 2. Fayl yuklash uchun (multipart/form-data)
export const apiUpload = async (endpoint: string, formData: FormData) => {
    const { access } = getTokens();
    const fullUrl = getFullUrl(endpoint);

    console.log("🚀 Fayl yuklanmoqda:", fullUrl);

    const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
            // "Content-Type" bu yerda yozilmaydi!
            ...(access && { Authorization: `Bearer ${access}` }),
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
        throw new Error(errorData.message || "Fayl yuklashda xatolik");
    }

    return response.json();
};