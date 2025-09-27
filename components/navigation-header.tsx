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
import { getSession } from "@/lib/session";
import { ProfileCard } from "./profile-card";
import { SignOutButton } from "./sign-out-button";

export async function NavigationHeader() {
    const session = await getSession();

    const menuItems = [
        { name: "Home", href: "/" },
        ...(session ? [{ name: "Dashboard", href: "/dashboard" }] : []),
    ];

    return (
        <Navbar
            className="border-border/50 border-b bg-zinc-900 shadow-sm backdrop-blur-xl"
            height="4rem"
            maxWidth="2xl"
            shouldHideOnScroll
        >
            {/* Brand */}
            <NavbarBrand>
                <NextLink
                    className="flex items-center gap-3 transition-all duration-200 hover:scale-105"
                    href="/"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                        <FileText className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col">
                        <p className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text font-bold text-transparent text-xl">
                            Better Files
                        </p>
                        <p className="font-medium text-xs text-zinc-400">
                            Secure & Simple
                        </p>
                    </div>
                </NextLink>
            </NavbarBrand>

            {/* Desktop Navigation */}
            <NavbarContent className="hidden gap-8 sm:flex" justify="center">
                <NavbarItem>
                    <Link
                        as={NextLink}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all duration-200 hover:bg-accent/50 hover:text-accent-foreground"
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
                            className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all duration-200 hover:bg-accent/50 hover:text-accent-foreground"
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
                        <div className="flex items-center gap-4">
                            <ProfileCard session={session} />
                            <SignOutButton />
                        </div>
                    </NavbarItem>
                ) : (
                    <NavbarItem>
                        <Button
                            as={NextLink}
                            className="bg-gradient-to-r from-primary to-primary/90 font-semibold text-primary-foreground shadow-lg transition-all duration-200 hover:scale-105 hover:from-primary/90 hover:to-primary hover:shadow-xl"
                            href="/auth"
                            radius="lg"
                            size="sm"
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
            <NavbarMenu className="bg-background/95 pt-6 backdrop-blur-xl">
                {menuItems.map((item, index) => (
                    <NavbarMenuItem key={`${item.name}-${index}`}>
                        <Link
                            as={NextLink}
                            className="w-full rounded-lg px-4 py-3 font-medium transition-colors hover:bg-accent/50"
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
                        <div className="flex flex-col gap-4 border-border/50 border-t pt-6">
                            <ProfileCard session={session} />
                            <SignOutButton />
                        </div>
                    </NavbarMenuItem>
                ) : (
                    <NavbarMenuItem>
                        <Button
                            as={NextLink}
                            className="mt-4 w-full bg-gradient-to-r from-primary to-primary/90 font-semibold text-primary-foreground shadow-lg"
                            href="/auth"
                            radius="lg"
                        >
                            Sign In
                        </Button>
                    </NavbarMenuItem>
                )}
            </NavbarMenu>
        </Navbar>
    );
}
