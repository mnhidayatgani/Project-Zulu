/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  describe('Rendering', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('should render with default variant and size', () => {
      render(<Button>Default</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-slot', 'button')
    })

    it('should render as child component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      )
      const link = screen.getByRole('link', { name: 'Link Button' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
    })

    it('should apply custom className', () => {
      render(<Button className="custom-class">Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })
  })

  describe('Variants', () => {
    it('should render default variant', () => {
      render(<Button variant="default">Default</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render outline variant', () => {
      render(<Button variant="outline">Outline</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render link variant', () => {
      render(<Button variant="link">Link</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    it('should render default size', () => {
      render(<Button size="default">Default Size</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render small size', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render large size', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render icon size', () => {
      render(<Button size="icon">🔍</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should not trigger click when disabled', async () => {
      const user = userEvent.setup()
      const handleClick = jest.fn()
      
      render(<Button disabled onClick={handleClick}>Disabled</Button>)
      const button = screen.getByRole('button')
      
      await user.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should handle aria-invalid attribute', () => {
      render(<Button aria-invalid={true}>Invalid</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('Interactions', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup()
      const handleClick = jest.fn()
      
      render(<Button onClick={handleClick}>Click me</Button>)
      const button = screen.getByRole('button')
      
      await user.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should call onClick multiple times', async () => {
      const user = userEvent.setup()
      const handleClick = jest.fn()
      
      render(<Button onClick={handleClick}>Click me</Button>)
      const button = screen.getByRole('button')
      
      await user.click(button)
      await user.click(button)
      await user.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(3)
    })

    it('should handle keyboard events', async () => {
      const user = userEvent.setup()
      const handleClick = jest.fn()
      
      render(<Button onClick={handleClick}>Button</Button>)
      const button = screen.getByRole('button')
      
      button.focus()
      await user.keyboard('{Enter}')
      
      expect(handleClick).toHaveBeenCalled()
    })

    it('should support form submission', () => {
      const handleSubmit = jest.fn((e) => e.preventDefault())
      
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
    })
  })

  describe('Accessibility', () => {
    it('should have button role', () => {
      render(<Button>Button</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should support aria-label', () => {
      render(<Button aria-label="Custom label">🔍</Button>)
      expect(screen.getByLabelText('Custom label')).toBeInTheDocument()
    })

    it('should support aria-describedby', () => {
      render(
        <>
          <Button aria-describedby="description">Button</Button>
          <div id="description">This is a description</div>
        </>
      )
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-describedby', 'description')
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      
      render(
        <>
          <Button>Button 1</Button>
          <Button>Button 2</Button>
        </>
      )
      
      const button1 = screen.getByRole('button', { name: 'Button 1' })
      const button2 = screen.getByRole('button', { name: 'Button 2' })
      
      await user.tab()
      expect(button1).toHaveFocus()
      
      await user.tab()
      expect(button2).toHaveFocus()
    })
  })

  describe('SVG Icons', () => {
    it('should render with svg icon', () => {
      render(
        <Button>
          <svg data-testid="icon" />
          Click me
        </Button>
      )
      
      expect(screen.getByTestId('icon')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should apply proper svg styling', () => {
      const { container } = render(
        <Button>
          <svg className="size-4" />
          Icon Button
        </Button>
      )
      
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { container } = render(<Button />)
      expect(container.querySelector('button')).toBeInTheDocument()
    })

    it('should handle multiple children', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      )
      
      expect(screen.getByText('Icon')).toBeInTheDocument()
      expect(screen.getByText('Text')).toBeInTheDocument()
    })

    it('should combine multiple variants correctly', () => {
      const { container } = render(
        <Button variant="outline" size="lg" className="custom">
          Button
        </Button>
      )
      
      const button = container.querySelector('button')
      expect(button).toHaveClass('custom')
    })
  })
})
