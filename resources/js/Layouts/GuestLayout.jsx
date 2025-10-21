import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link } from "@inertiajs/react";

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            <div className="mt-6 w-full overflow-hidde bg-gray-100 border border-solid border-gray-400 backdrop-blur-lg px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                <div className=" w-full flex justify-center">
                    <Link href="/">Logo Etm</Link>
                </div>{" "}
                {children}
            </div>
        </div>
    );
}
