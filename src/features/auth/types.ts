export type UserType = 'buyer' | 'seller';

export interface UserProfile {
    id: string;
    email: string;
    nickname: string;
    userType: UserType;
    isAdmin: boolean;
}

export type AuthMode = 'login' | 'signup';
