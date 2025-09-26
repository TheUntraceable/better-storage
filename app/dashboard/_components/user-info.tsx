"use client";

import { useCustomer } from "autumn-js/react";
export const UserInfo = () => {
    const { customer } = useCustomer();
    return <div>Welcome, {JSON.stringify(customer)}</div>;
};
