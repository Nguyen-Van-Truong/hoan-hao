package request

// UserProfileUpdateRequest đại diện cho yêu cầu cập nhật thông tin người dùng
type UserProfileUpdateRequest struct {
	FullName     string `json:"full_name"`
	Bio          string `json:"bio"`
	Location     string `json:"location"`
	CountryID    int    `json:"country_id"`
	ProvinceID   int    `json:"province_id"`
	DistrictID   int    `json:"district_id"`
	Website      string `json:"website"`
	DateOfBirth  string `json:"date_of_birth"` // Format: YYYY-MM-DD
	Work         string `json:"work"`
	Education    string `json:"education"`
	Relationship string `json:"relationship"`
}
