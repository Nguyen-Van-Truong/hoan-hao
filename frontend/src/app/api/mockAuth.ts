// frontend/src/app/api/mockAuth.ts
export async function mockLogin(email: string, password: string) {
    return new Promise<{ token: string; user: { email: string; name: string } }>((resolve, reject) => {
        setTimeout(() => {
            if (email === "1@gmail.com" && password === "123456") {
                resolve({
                    token: "fake-jwt-token",
                    user: { email, name: "Người Dùng" },
                });
            } else {
                reject(new Error("Sai thông tin đăng nhập!"));
            }
        }, 1000);
    });
}

export async function mockRegister(email: string, password: string) {
    return new Promise<{ message: string }>((resolve, reject) => {
        setTimeout(() => {
            if (email && password.length >= 6) {
                resolve({ message: "Đăng ký thành công! Vui lòng đăng nhập." });
            } else {
                reject(new Error("Đăng ký thất bại. Kiểm tra lại thông tin."));
            }
        }, 1000);
    });
}

export async function mockForgotPassword(email: string) {
    return new Promise<{ message: string }>((resolve, reject) => {
        setTimeout(() => {
            if (email === "1@gmail.com") {
                resolve({ message: "Email đặt lại mật khẩu đã được gửi!" });
            } else {
                reject(new Error("Email không tồn tại trong hệ thống!"));
            }
        }, 1000);
    });
}

export async function mockResetPassword(token: string, newPassword: string) {
    return new Promise<{ message: string }>((resolve, reject) => {
        setTimeout(() => {
            if (token === "valid-token") {
                if (newPassword.length >= 6) {
                    resolve({ message: "Mật khẩu đã được đặt lại thành công!" });
                } else {
                    reject(new Error("Mật khẩu phải có ít nhất 6 ký tự!"));
                }
            } else {
                reject(new Error("Token không hợp lệ hoặc đã hết hạn!"));
            }
        }, 1000);
    });
}
