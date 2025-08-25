import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const WORDPRESS_CONFIG = {
    url: 'https://tax4us.co.il',
    username: 'admin',
    password: 'uVQm smKl vecQ WmEa 9cbW vn6N',
    applicationPassword: 'uVQm smKl vecQ WmEa 9cbW vn6N'
};

export async function POST(request: NextRequest) {
    try {
        const { method, params } = await request.json();

        switch (method) {
            case 'list_posts':
                return await listPosts(params);
            case 'create_post':
                return await createPost(params);
            case 'update_post':
                return await updatePost(params);
            case 'delete_post':
                return await deletePost(params);
            case 'list_pages':
                return await listPages(params);
            case 'create_page':
                return await createPage(params);
            case 'update_page':
                return await updatePage(params);
            case 'delete_page':
                return await deletePage(params);
            case 'get_site_info':
                return await getSiteInfo();
            default:
                return NextResponse.json(
                    { error: `Unknown method: ${method}` },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('WordPress MCP API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function listPosts(params: any = {}) {
    try {
        const { per_page = 10, status = 'publish', page = 1 } = params;

        const response = await axios.get(
            `${WORDPRESS_CONFIG.url}/wp-json/wp/v2/posts`,
            {
                auth: {
                    username: WORDPRESS_CONFIG.username,
                    password: WORDPRESS_CONFIG.applicationPassword
                },
                params: {
                    per_page,
                    status,
                    page
                }
            }
        );

        return NextResponse.json({
            success: true,
            data: response.data,
            total: response.headers['x-wp-total'],
            totalPages: response.headers['x-wp-totalpages']
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

async function createPost(params: any) {
    try {
        const { title, content, status = 'draft', categories = [], tags = [] } = params;

        const response = await axios.post(
            `${WORDPRESS_CONFIG.url}/wp-json/wp/v2/posts`,
            {
                title,
                content,
                status,
                categories,
                tags
            },
            {
                auth: {
                    username: WORDPRESS_CONFIG.username,
                    password: WORDPRESS_CONFIG.applicationPassword
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        return NextResponse.json({
            success: true,
            data: response.data
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

async function updatePost(params: any) {
    try {
        const { id, title, content, status, categories, tags } = params;

        const response = await axios.put(
            `${WORDPRESS_CONFIG.url}/wp-json/wp/v2/posts/${id}`,
            {
                title,
                content,
                status,
                categories,
                tags
            },
            {
                auth: {
                    username: WORDPRESS_CONFIG.username,
                    password: WORDPRESS_CONFIG.applicationPassword
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        return NextResponse.json({
            success: true,
            data: response.data
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

async function deletePost(params: any) {
    try {
        const { id } = params;

        const response = await axios.delete(
            `${WORDPRESS_CONFIG.url}/wp-json/wp/v2/posts/${id}`,
            {
                auth: {
                    username: WORDPRESS_CONFIG.username,
                    password: WORDPRESS_CONFIG.applicationPassword
                }
            }
        );

        return NextResponse.json({
            success: true,
            data: response.data
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

async function listPages(params: any = {}) {
    try {
        const { per_page = 10, status = 'publish', page = 1 } = params;

        const response = await axios.get(
            `${WORDPRESS_CONFIG.url}/wp-json/wp/v2/pages`,
            {
                auth: {
                    username: WORDPRESS_CONFIG.username,
                    password: WORDPRESS_CONFIG.applicationPassword
                },
                params: {
                    per_page,
                    status,
                    page
                }
            }
        );

        return NextResponse.json({
            success: true,
            data: response.data,
            total: response.headers['x-wp-total'],
            totalPages: response.headers['x-wp-totalpages']
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

async function createPage(params: any) {
    try {
        const { title, content, status = 'draft', slug } = params;

        const response = await axios.post(
            `${WORDPRESS_CONFIG.url}/wp-json/wp/v2/pages`,
            {
                title,
                content,
                status,
                slug
            },
            {
                auth: {
                    username: WORDPRESS_CONFIG.username,
                    password: WORDPRESS_CONFIG.applicationPassword
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        return NextResponse.json({
            success: true,
            data: response.data
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

async function updatePage(params: any) {
    try {
        const { id, title, content, status, slug } = params;

        const response = await axios.put(
            `${WORDPRESS_CONFIG.url}/wp-json/wp/v2/pages/${id}`,
            {
                title,
                content,
                status,
                slug
            },
            {
                auth: {
                    username: WORDPRESS_CONFIG.username,
                    password: WORDPRESS_CONFIG.applicationPassword
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        return NextResponse.json({
            success: true,
            data: response.data
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

async function deletePage(params: any) {
    try {
        const { id } = params;

        const response = await axios.delete(
            `${WORDPRESS_CONFIG.url}/wp-json/wp/v2/pages/${id}`,
            {
                auth: {
                    username: WORDPRESS_CONFIG.username,
                    password: WORDPRESS_CONFIG.applicationPassword
                }
            }
        );

        return NextResponse.json({
            success: true,
            data: response.data
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

async function getSiteInfo() {
    try {
        const response = await axios.get(
            `${WORDPRESS_CONFIG.url}/wp-json/`,
            {
                auth: {
                    username: WORDPRESS_CONFIG.username,
                    password: WORDPRESS_CONFIG.applicationPassword
                }
            }
        );

        return NextResponse.json({
            success: true,
            data: {
                name: response.data.name,
                description: response.data.description,
                url: response.data.url,
                home: response.data.home,
                gmt_offset: response.data.gmt_offset,
                timezone_string: response.data.timezone_string,
                namespaces: response.data.namespaces,
                authentication: response.data.authentication,
                routes: response.data.routes
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
