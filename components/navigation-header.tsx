import { getSession } from "@/lib/session";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle,
} from "@heroui/navbar";
import { FileText, Home, User } from "lucide-react";
import NextLink from "next/link";
import { SignOutButton } from "./sign-out-button";

export async function NavigationHeader() {
    const session = await getSession();

    const menuItems = [
        { name: "Home", href: "/" },
        ...(session ? [{ name: "Dashboard", href: "/dashboard" }] : []),
    ];

    return (
        <Navbar
            className="bg-background/70 backdrop-blur-md"
            maxWidth="xl"
            shouldHideOnScroll
        >
            {/* Brand */}
            <NavbarBrand>
                <NextLink className="flex items-center gap-2" href="/">
                    <FileText className="h-6 w-6 text-primary" />
                    <p className="font-bold text-inherit text-xl">
                        Better Files
                    </p>
                </NextLink>
            </NavbarBrand>

            {/* Desktop Navigation */}
            <NavbarContent className="hidden gap-4 sm:flex" justify="center">
                <NavbarItem>
                    <Link
                        as={NextLink}
                        className="flex items-center gap-2"
                        color="foreground"
                        href="/"
                    >
                        <Home className="h-4 w-4" />
                        Home
                    </Link>
                </NavbarItem>
                {session && (
                    <NavbarItem>
                        <Link
                            as={NextLink}
                            className="flex items-center gap-2"
                            color="foreground"
                            href="/dashboard"
                        >
                            <User className="h-4 w-4" />
                            Dashboard
                        </Link>
                    </NavbarItem>
                )}
            </NavbarContent>

            {/* User Actions */}
            <NavbarContent justify="end">
                {session ? (
                    <NavbarItem className="hidden lg:flex">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-xs">
                                    {(session.name || session.email || "??")
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm">
                                        {session.name || session.email}
                                    </span>
                                </div>
                            </div>
                            <SignOutButton />
                        </div>
                    </NavbarItem>
                ) : (
                    <NavbarItem>
                        <Button
                            as={NextLink}
                            color="primary"
                            href="/auth"
                            size="sm"
                            variant="flat"
                        >
                            Sign In
                        </Button>
                    </NavbarItem>
                )}
                <NavbarMenuToggle
                    aria-label="toggle navigation"
                    className="sm:hidden"
                />
            </NavbarContent>

            {/* Mobile Menu */}
            <NavbarMenu>
                {menuItems.map((item, index) => (
                    <NavbarMenuItem key={`${item.name}-${index}`}>
                        <Link
                            as={NextLink}
                            className="w-full"
                            color="foreground"
                            href={item.href}
                            size="lg"
                        >
                            {item.name}
                        </Link>
                    </NavbarMenuItem>
                ))}
                {session ? (
                    <NavbarMenuItem>
                        <div className="flex flex-col gap-3 pt-4">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-xs">
                                    {(session.name || session.email || "??")
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2)}
                                </div>
                                <span className="font-medium text-sm">
                                    {session.name || session.email}
                                </span>
                            </div>
                            <SignOutButton />
                        </div>
                    </NavbarMenuItem>
                ) : (
                    <NavbarMenuItem>
                        <Button
                            as={NextLink}
                            className="w-full"
                            color="primary"
                            href="/auth"
                            variant="flat"
                        >
                            Sign In
                        </Button>
                    </NavbarMenuItem>
                )}
            </NavbarMenu>
        </Navbar>
    );
}
