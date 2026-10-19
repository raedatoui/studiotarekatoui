import { Link } from '@payloadcms/ui';
import type { ServerProps } from 'payload';

export function DashboardGuide({ payload }: ServerProps) {
    const admin = payload.config.routes.admin;

    return (
        <section className="studio-dashboard-guide" aria-labelledby="studio-dashboard-guide-title">
            <h2 id="studio-dashboard-guide-title">Managing content and pages</h2>
            <p>
                Use <strong>Content</strong> to add and edit individual records. Use <strong>Pages</strong> to change the headings and introductions
                around those records.
            </p>
            <div className="studio-dashboard-guide__table" role="region" aria-label="Content and page editors" tabIndex={0}>
                <table>
                    <thead>
                        <tr>
                            <th scope="col">Area</th>
                            <th scope="col">Content — individual records</th>
                            <th scope="col">Pages — headings and introductions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row">Research</th>
                            <td>
                                <Link href={`${admin}/collections/research`} prefetch={false}>Research projects</Link>
                                <p>Project descriptions, events, images, media and press.</p>
                            </td>
                            <td>
                                <Link href={`${admin}/globals/research-page`} prefetch={false}>Research</Link>
                                <p>The Research overview section title, heading and introduction.</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Chronology</th>
                            <td>
                                <Link href={`${admin}/globals/chronology`} prefetch={false}>Chronology entries</Link>
                                <p>Timeline projects, dates, locations, collaborators and documentation.</p>
                            </td>
                            <td>
                                <Link href={`${admin}/globals/chronology/introduction`} prefetch={false}>Chronology</Link>
                                <p>The Chronology heading and introduction.</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Publications</th>
                            <td>
                                <Link href={`${admin}/collections/publications`} prefetch={false}>Publication entries</Link>
                                <p>Individual books and records, including covers, descriptions, prices and availability.</p>
                            </td>
                            <td>
                                <Link href={`${admin}/globals/publications-page`} prefetch={false}>Publications</Link>
                                <p>The Publications heading and optional introduction.</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p>
                For example, add a book under <strong>Content → Publications</strong>. Change the text above the publication list under{' '}
                <strong>Pages → Publications</strong>. News, About and Contact are also available under{' '}
                <Link href={`${admin}/pages`} prefetch={false}>Pages</Link>.
            </p>
            <p>
                <Link href={`${admin}/globals/navigation`} prefetch={false}>Website → Navigation</Link> controls menu labels, destinations and ordering
                for both desktop and mobile.
            </p>
            <p>
                <strong>Publishing workflow:</strong> Save and review drafts → publish approved content → export fresh content with{' '}
                <strong>Export JSON</strong> → rebuild and deploy the website. Publishing in the CMS alone does not immediately update the website.
            </p>
            <p>
                <strong>Staging only:</strong> The new Publications and Chronology pages are available in local development and staging. Production
                keeps the Publications menu link pointing to Galerie Chantal Crousel. Checkout is not configured.
            </p>
        </section>
    );
}
