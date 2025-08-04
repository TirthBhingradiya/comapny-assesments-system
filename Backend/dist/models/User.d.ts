import mongoose from 'mongoose';
export interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'admin' | 'manager' | 'employee';
    department: string;
    position: string;
    employeeId: string;
    phone?: string;
    avatar?: string;
    isActive: boolean;
    lastLogin?: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser> & IUser & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
