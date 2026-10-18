import { signOut } from '../auth';

export function GoogleLogout() {
    return (
        <form
            action={async () => {
                'use server';
                await signOut({ redirectTo: '/admin/login' });
            }}
        >
            <button className="btn btn--style-secondary btn--size-small" type="submit">
                Sign out
            </button>
        </form>
    );
}
