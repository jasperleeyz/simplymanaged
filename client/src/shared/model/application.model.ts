export interface IApplicationCode {
    id: number;
    code_type: string;
    code: string;
    description: string;
    status: string;
    created_by?: string;
    created_date?: Date;
    updated_by?: string;
    updated_date?: Date;
}

export interface ISubscriptionModel {
    id: number;
    name: string;
    member_limit: number;
    payment_cycle: string;
    price: number;
    created_by?: string;
    created_date?: Date;
    updated_by?: string;
    updated_date?: Date;
}