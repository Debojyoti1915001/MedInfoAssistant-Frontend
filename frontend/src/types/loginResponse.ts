// {
//     "id": 2,
//     "name": "Shristi",
//     "email": "shristi@gmail.com",
//     "phnNumber": "123456789",
//     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJzaHJpc3RpQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzcxNjU2NjcwLCJpYXQiOjE3NzE1NzAyNzB9.-paHhNM5ET6EJne6XGaql8u84AYBM6m98eU2nMWIN4c"
// }


// {
//     "id": 2,
//     "createdAt": "2026-02-20T07:11:56.995769Z",
//     "accuracy": 0,
//     "name": "Dan",
//     "phnNumber": "1234556",
//     "speciality": "gynac",
//     "username": "dan",
//     "email": "dan923@gmail.com"
// }
export interface LoginResponse {
  id: number
  name: string
  email: string
  phnNumber: string
  token: string
}

export interface DoctorSignupResponse {
  id: number
  createdAt: string
  accuracy: number
  name: string
  phnNumber: string
  speciality: string
  username: string
  email: string
}