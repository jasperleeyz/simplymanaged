interface IUser {
    id: number;
    name: string;
    email: string;
    phoneNo: number;
    role: string;
    position: string;
    employmentType: string;
    profileImage?: string;
}

export default IUser;