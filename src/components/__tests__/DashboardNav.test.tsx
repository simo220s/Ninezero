import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DashboardNav from '../DashboardNav'
import { Home, Calendar, CreditCard } from 'lucide-react'

describe('DashboardNav', () => {
  const mockItems = [
    {
      label: 'الصفحة الرئيسية',
      icon: <Home className="w-5 h-5" />,
      path: '/dashboard/student'
    },
    {
      label: 'الحصص القادمة',
      icon: <Calendar className="w-5 h-5" />,
      path: '/dashboard/student/classes',
      badge: '3'
    },
    {
      label: 'الاشتراكات',
      icon: <CreditCard className="w-5 h-5" />,
      path: '/dashboard/student/subscription'
    }
  ]

  it('renders all navigation items', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard/student']}>
        <DashboardNav items={mockItems} />
      </MemoryRouter>
    )

    expect(container.textContent).toContain('الصفحة الرئيسية')
    expect(container.textContent).toContain('الحصص القادمة')
    expect(container.textContent).toContain('الاشتراكات')
  })

  it('displays badge when provided', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard/student']}>
        <DashboardNav items={mockItems} />
      </MemoryRouter>
    )

    expect(container.textContent).toContain('3')
  })

  it('has RTL direction', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard/student']}>
        <DashboardNav items={mockItems} />
      </MemoryRouter>
    )

    const nav = container.querySelector('nav')
    expect(nav?.getAttribute('dir')).toBe('rtl')
  })

  it('renders correct number of navigation items', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard/student']}>
        <DashboardNav items={mockItems} />
      </MemoryRouter>
    )

    const links = container.querySelectorAll('a')
    expect(links).toHaveLength(3)
  })

  it('highlights active page - Home', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard/student']}>
        <DashboardNav items={mockItems} />
      </MemoryRouter>
    )

    const links = container.querySelectorAll('a')
    const homeLink = Array.from(links).find((link): link is HTMLAnchorElement => 
      link instanceof HTMLAnchorElement && link.getAttribute('href') === '/dashboard/student'
    )
    
    expect(homeLink?.className).toContain('border-primary-600')
    expect(homeLink?.className).toContain('text-primary-600')
    expect(homeLink?.className).toContain('bg-primary-50')
    expect(homeLink?.getAttribute('aria-current')).toBe('page')
  })

  it('highlights active page - Classes', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard/student/classes']}>
        <DashboardNav items={mockItems} />
      </MemoryRouter>
    )

    const links = container.querySelectorAll('a')
    const classesLink = Array.from(links).find((link): link is HTMLAnchorElement => 
      link instanceof HTMLAnchorElement && link.getAttribute('href') === '/dashboard/student/classes'
    )
    
    expect(classesLink?.className).toContain('border-primary-600')
    expect(classesLink?.className).toContain('text-primary-600')
    expect(classesLink?.className).toContain('bg-primary-50')
    expect(classesLink?.getAttribute('aria-current')).toBe('page')
  })

  it('highlights active page - Subscription', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard/student/subscription']}>
        <DashboardNav items={mockItems} />
      </MemoryRouter>
    )

    const links = container.querySelectorAll('a')
    const subscriptionLink = Array.from(links).find((link): link is HTMLAnchorElement => 
      link instanceof HTMLAnchorElement && link.getAttribute('href') === '/dashboard/student/subscription'
    )
    
    expect(subscriptionLink?.className).toContain('border-primary-600')
    expect(subscriptionLink?.className).toContain('text-primary-600')
    expect(subscriptionLink?.className).toContain('bg-primary-50')
    expect(subscriptionLink?.getAttribute('aria-current')).toBe('page')
  })

  it('only highlights one active page at a time', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard/student/classes']}>
        <DashboardNav items={mockItems} />
      </MemoryRouter>
    )

    const links = container.querySelectorAll('a')
    const activeLinks = Array.from(links).filter((link): link is HTMLAnchorElement => 
      link instanceof HTMLAnchorElement &&
      link.className.includes('border-primary-600') && 
      link.getAttribute('aria-current') === 'page'
    )
    
    expect(activeLinks).toHaveLength(1)
  })

  it('has sticky positioning for navigation persistence', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard/student']}>
        <DashboardNav items={mockItems} />
      </MemoryRouter>
    )

    const nav = container.querySelector('nav')
    expect(nav?.className).toContain('sticky')
    expect(nav?.className).toContain('top-0')
  })

  it('is mobile responsive with proper touch targets', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard/student']}>
        <DashboardNav items={mockItems} />
      </MemoryRouter>
    )

    const links = container.querySelectorAll('a')
    links.forEach(link => {
      expect(link.className).toContain('min-h-[44px]')
    })
  })

  it('displays navigation items in RTL order', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard/student']}>
        <DashboardNav items={mockItems} />
      </MemoryRouter>
    )

    const navContainer = container.querySelector('.flex-row-reverse')
    expect(navContainer).toBeTruthy()
  })
})
