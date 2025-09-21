export const calculateRealm = (level: number): string => {
    if (level >= 1 && level <= 9) return `Phàm Nhân - Luyện Thể tầng ${level}`;
    if (level >= 10 && level <= 20) return `Phàm Nhân - Khai Linh tầng ${level - 9}`;
    if (level >= 21 && level <= 29) return `Tu Luyện Giả - Luyện Khí tầng ${level - 20}`;
    if (level >= 30 && level <= 33) {
        if (level === 30) return "Tu Luyện Giả - Trúc Cơ sơ kỳ";
        if (level >= 31 && level <= 32) return "Tu Luyện Giả - Trúc Cơ trung kỳ";
        return "Tu Luyện Giả - Trúc Cơ hậu kỳ";
    }
    if (level >= 34 && level <= 36) {
        if (level === 34) return "Tu Luyện Giả - Kim Đan sơ kỳ";
        if (level === 35) return "Tu Luyện Giả - Kim Đan trung kỳ";
        return "Tu Luyện Giả - Kim Đan hậu kỳ";
    }
    if (level >= 37 && level <= 39) {
        if (level === 37) return "Tiên Giới - Nguyên Anh sơ kỳ";
        if (level === 38) return "Tiên Giới - Nguyên Anh trung kỳ";
        return "Tiên Giới - Nguyên Anh hậu kỳ";
    }
    if (level >= 40 && level <= 49) {
        if (level <= 42) return "Tiên Giới - Hóa Thần sơ kỳ";
        if (level <= 46) return "Tiên Giới - Hóa Thần trung kỳ";
        return "Tiên Giới - Hóa Thần hậu kỳ";
    }
    if (level >= 50 && level <= 59) {
        if (level <= 52) return "Tiên Giới - Đại Thừa sơ kỳ";
        if (level <= 56) return "Tiên Giới - Đại Thừa trung kỳ";
        return "Tiên Giới - Đại Thừa hậu kỳ";
    }
    if (level >= 60 && level <= 69) return "Tiên Giới - Độ Kiếp";
    if (level >= 70 && level <= 79) {
        if (level <= 72) return "Chân Tiên - Tiên Nhân hạ phẩm";
        if (level <= 76) return "Chân Tiên - Tiên Nhân trung phẩm";
        return "Chân Tiên - Tiên Nhân thượng phẩm";
    }
    if (level >= 80 && level <= 89) return "Chân Tiên - Kim Tiên / Thái Ất Chân Tiên";
    if (level >= 90 && level <= 99) return "Thánh Nhân - Tiên Đế / Đạo Tổ";
    if (level >= 100) return "Tối Thượng - Hỗn Độn Thánh Nhân / Chúa Tể Vĩnh Hằng";
    
    return "Phàm Nhân"; // Fallback
};
