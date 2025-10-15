/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge', () => {
  describe('Rendering', () => {
    it('should render badge with text', () => {
      render(<Badge>New</Badge>)
      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      const { container } = render(<Badge>Badge</Badge>)
      const badge = container.querySelector('[data-slot="badge"]')
      expect(badge).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<Badge className="custom-class">Badge</Badge>)
      const badge = screen.getByText('Badge')
      expect(badge).toHaveClass('custom-class')
    })

    it('should render as span by default', () => {
      const { container } = render(<Badge>Badge</Badge>)
      const badge = container.querySelector('span')
      expect(badge).toBeInTheDocument()
    })

    it('should render as child component when asChild is true', () => {
      render(
        <Badge asChild>
          <a href="/test">Link Badge</a>
        </Badge>
      )
      const link = screen.getByRole('link', { name: 'Link Badge' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
    })
  })

  describe('Variants', () => {
    it('should render default variant', () => {
      render(<Badge variant="default">Default</Badge>)
      const badge = screen.getByText('Default')
      expect(badge).toBeInTheDocument()
    })

    it('should render secondary variant', () => {
      render(<Badge variant="secondary">Secondary</Badge>)
      const badge = screen.getByText('Secondary')
      expect(badge).toBeInTheDocument()
    })

    it('should render destructive variant', () => {
      render(<Badge variant="destructive">Error</Badge>)
      const badge = screen.getByText('Error')
      expect(badge).toBeInTheDocument()
    })

    it('should render outline variant', () => {
      render(<Badge variant="outline">Outline</Badge>)
      const badge = screen.getByText('Outline')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Content', () => {
    it('should render text content', () => {
      render(<Badge>Simple text</Badge>)
      expect(screen.getByText('Simple text')).toBeInTheDocument()
    })

    it('should render with number content', () => {
      render(<Badge>42</Badge>)
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('should render with icon', () => {
      render(
        <Badge>
          <svg data-testid="icon" />
          With Icon
        </Badge>
      )
      expect(screen.getByTestId('icon')).toBeInTheDocument()
      expect(screen.getByText('With Icon')).toBeInTheDocument()
    })

    it('should render emoji', () => {
      render(<Badge>🔥 Hot</Badge>)
      expect(screen.getByText('🔥 Hot')).toBeInTheDocument()
    })

    it('should handle multiple children', () => {
      render(
        <Badge>
          <span>Part 1</span>
          <span>Part 2</span>
        </Badge>
      )
      expect(screen.getByText('Part 1')).toBeInTheDocument()
      expect(screen.getByText('Part 2')).toBeInTheDocument()
    })
  })

  describe('As Link', () => {
    it('should work as link with asChild', () => {
      render(
        <Badge asChild>
          <a href="/path">Link Badge</a>
        </Badge>
      )
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/path')
      expect(link).toHaveAttribute('data-slot', 'badge')
    })

    it('should support external links', () => {
      render(
        <Badge asChild>
          <a href="https://example.com" target="_blank" rel="noopener noreferrer">
            External
          </a>
        </Badge>
      )
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(<Badge aria-label="Status badge">Active</Badge>)
      expect(screen.getByLabelText('Status badge')).toBeInTheDocument()
    })

    it('should support aria-describedby', () => {
      render(
        <>
          <Badge aria-describedby="description">Badge</Badge>
          <div id="description">Badge description</div>
        </>
      )
      const badge = screen.getByText('Badge')
      expect(badge).toHaveAttribute('aria-describedby', 'description')
    })

    it('should handle aria-invalid attribute', () => {
      render(<Badge aria-invalid={true}>Invalid</Badge>)
      const badge = screen.getByText('Invalid')
      expect(badge).toHaveAttribute('aria-invalid', 'true')
    })

    it('should support role attribute', () => {
      render(<Badge role="status">Status</Badge>)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('Status Badges', () => {
    it('should render success badge', () => {
      render(<Badge variant="secondary">Success</Badge>)
      expect(screen.getByText('Success')).toBeInTheDocument()
    })

    it('should render error badge', () => {
      render(<Badge variant="destructive">Error</Badge>)
      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    it('should render warning badge', () => {
      render(<Badge variant="outline">Warning</Badge>)
      expect(screen.getByText('Warning')).toBeInTheDocument()
    })

    it('should render info badge', () => {
      render(<Badge variant="default">Info</Badge>)
      expect(screen.getByText('Info')).toBeInTheDocument()
    })
  })

  describe('Count Badges', () => {
    it('should display notification count', () => {
      render(<Badge>5</Badge>)
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should display large numbers', () => {
      render(<Badge>999+</Badge>)
      expect(screen.getByText('999+')).toBeInTheDocument()
    })

    it('should handle zero count', () => {
      render(<Badge>0</Badge>)
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { container } = render(<Badge />)
      const badge = container.querySelector('span')
      expect(badge).toBeInTheDocument()
    })

    it('should handle long text', () => {
      const longText = 'This is a very long badge text that should be handled properly'
      render(<Badge>{longText}</Badge>)
      expect(screen.getByText(longText)).toBeInTheDocument()
    })

    it('should handle special characters', () => {
      const specialText = '!@#$%^&*()'
      render(<Badge>{specialText}</Badge>)
      expect(screen.getByText(specialText)).toBeInTheDocument()
    })

    it('should handle unicode characters', () => {
      const unicode = '你好 🌍 مرحبا'
      render(<Badge>{unicode}</Badge>)
      expect(screen.getByText(unicode)).toBeInTheDocument()
    })

    it('should combine variant and className', () => {
      render(<Badge variant="destructive" className="custom">Error</Badge>)
      const badge = screen.getByText('Error')
      expect(badge).toHaveClass('custom')
    })
  })

  describe('Interactive Badge', () => {
    it('should be clickable when used with button', () => {
      const handleClick = jest.fn()
      render(
        <Badge asChild>
          <button onClick={handleClick}>Clickable</button>
        </Badge>
      )
      
      const button = screen.getByRole('button')
      button.click()
      expect(handleClick).toHaveBeenCalled()
    })

    it('should be keyboard accessible when interactive', () => {
      render(
        <Badge asChild>
          <button>Keyboard Badge</button>
        </Badge>
      )
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('SVG Icons', () => {
    it('should render with svg icon', () => {
      render(
        <Badge>
          <svg data-testid="badge-icon" width="16" height="16" />
          Badge
        </Badge>
      )
      
      expect(screen.getByTestId('badge-icon')).toBeInTheDocument()
    })

    it('should apply proper svg sizing', () => {
      const { container } = render(
        <Badge>
          <svg className="size-3" />
          Icon Badge
        </Badge>
      )
      
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('size-3')
    })
  })
})
