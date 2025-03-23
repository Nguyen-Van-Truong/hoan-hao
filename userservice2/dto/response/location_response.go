package response

// CountryResponse đại diện cho dữ liệu phản hồi về quốc gia
type CountryResponse struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Code      string `json:"code"`
	PhoneCode string `json:"phone_code,omitempty"`
}

// ProvinceResponse đại diện cho dữ liệu phản hồi về tỉnh/thành phố
type ProvinceResponse struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Code      string `json:"code"`
	CountryID int    `json:"country_id"`
}

// DistrictResponse đại diện cho dữ liệu phản hồi về quận/huyện
type DistrictResponse struct {
	ID         int    `json:"id"`
	Name       string `json:"name"`
	Code       string `json:"code"`
	ProvinceID int    `json:"province_id"`
}

// LocationResponse là cấu trúc kết hợp các thông tin vị trí địa lý
type LocationResponse struct {
	Country  *CountryResponse  `json:"country,omitempty"`
	Province *ProvinceResponse `json:"province,omitempty"`
	District *DistrictResponse `json:"district,omitempty"`
}
