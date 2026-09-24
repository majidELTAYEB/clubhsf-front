export async function load({ locals }) {
    return {
        accessToken: locals.accessToken,
        user: locals.user,
        profile: locals.userProfile
    };
}