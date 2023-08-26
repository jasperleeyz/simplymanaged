interface IUser {
    id: number;
    name: string;
    email: string;
    phoneNo: string;
    role: string;
    position: string;
    employmentType: string;
    profileImage?: string;
}

export default IUser;