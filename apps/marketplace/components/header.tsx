'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { 
  Bars3Icon, 
  XMarkIcon, 
  ShoppingCartIcon,
  UserIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  const navigation = [
    { name: 'Products', href: '/products' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Documentation', href: '/docs' },
    { name: 'Support', href: '/support' },
  ];

  const productCategories = [
    { name: 'Email Automation', href: '/products/email-automation' },
    { name: 'Business Process', href: '/products/business-process' },
    { name: 'Content Generation', href: '/products/content-generation' },
    { name: 'Financial Automation', href: '/products/financial' },
    { name: 'Customer Management', href: '/products/customer-management' },
    { name: 'Technical Integration', href: '/products/technical' },
  ];

  return (
    <header className="bg-dark-900/95 backdrop-blur-sm border-b border-dark-700 sticky top-0 z-50">
      <nav className="container-max section-padding" aria-label="Top">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-bold gradient-text">Rensto</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-1 text-white hover:text-primary-500 transition-colors">
                <span>Products</span>
                <ChevronDownIcon className="w-4 h-4" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Menu.Items className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-lg bg-dark-800 border border-dark-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    {productCategories.map((category) => (
                      <Menu.Item key={category.name}>
                        {({ active }) => (
                          <Link
                            href={category.href}
                            className={`${
                              active ? 'bg-dark-700 text-primary-500' : 'text-white'
                            } block px-4 py-2 text-sm transition-colors`}
                          >
                            {category.name}
                          </Link>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            {navigation.slice(1).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-primary-500 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            {session ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 text-white hover:text-primary-500 transition-colors">
                  <UserIcon className="w-5 h-5" />
                  <span>{session.user?.name || session.user?.email}</span>
                  <ChevronDownIcon className="w-4 h-4" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-dark-800 border border-dark-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/dashboard"
                            className={`${
                              active ? 'bg-dark-700 text-primary-500' : 'text-white'
                            } block px-4 py-2 text-sm transition-colors`}
                          >
                            Dashboard
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/account"
                            className={`${
                              active ? 'bg-dark-700 text-primary-500' : 'text-white'
                            } block px-4 py-2 text-sm transition-colors`}
                          >
                            Account Settings
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => signOut()}
                            className={`${
                              active ? 'bg-dark-700 text-primary-500' : 'text-white'
                            } block w-full text-left px-4 py-2 text-sm transition-colors`}
                          >
                            Sign Out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <button
                onClick={() => signIn()}
                className="btn-outline"
              >
                Sign In
              </button>
            )}
            
            <Link href="/cart" className="relative p-2 text-white hover:text-primary-500 transition-colors">
              <ShoppingCartIcon className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              type="button"
              className="text-white hover:text-primary-500 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-dark-800 rounded-lg mt-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-primary-500 block px-3 py-2 text-base font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-dark-700 pt-4">
                {session ? (
                  <div className="space-y-2">
                    <Link
                      href="/dashboard"
                      className="text-white hover:text-primary-500 block px-3 py-2 text-base font-medium transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="text-white hover:text-primary-500 block w-full text-left px-3 py-2 text-base font-medium transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      signIn();
                      setMobileMenuOpen(false);
                    }}
                    className="btn-primary w-full mx-3"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

