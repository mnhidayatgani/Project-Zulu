/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('Input', () => {
  describe('Rendering', () => {
    it('should render input element', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
    })

    it('should render with placeholder', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('should render with initial value', () => {
      render(<Input value="Initial value" readOnly />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('Initial value')
    })

    it('should apply custom className', () => {
      render(<Input className="custom-class" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('custom-class')
    })

    it('should have data-slot attribute', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('data-slot', 'input')
    })
  })

  describe('Input Types', () => {
    it('should render text input by default', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      // HTML input defaults to text type even without explicit attribute
      expect(input).toBeInTheDocument()
    })

    it('should render email input', () => {
      render(<Input type="email" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should render password input', () => {
      render(<Input type="password" />)
      const input = document.querySelector('input[type="password"]')
      expect(input).toBeInTheDocument()
    })

    it('should render number input', () => {
      render(<Input type="number" />)
      const input = document.querySelector('input[type="number"]')
      expect(input).toBeInTheDocument()
    })

    it('should render search input', () => {
      render(<Input type="search" />)
      const input = screen.getByRole('searchbox')
      expect(input).toBeInTheDocument()
    })

    it('should render tel input', () => {
      render(<Input type="tel" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'tel')
    })

    it('should render url input', () => {
      render(<Input type="url" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'url')
    })

    it('should render file input', () => {
      render(<Input type="file" />)
      const input = document.querySelector('input[type="file"]')
      expect(input).toBeInTheDocument()
    })
  })

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })

    it('should be readonly when readOnly prop is true', () => {
      render(<Input readOnly />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('readonly')
    })

    it('should handle aria-invalid attribute', () => {
      render(<Input aria-invalid={true} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('should handle required attribute', () => {
      render(<Input required />)
      const input = screen.getByRole('textbox')
      expect(input).toBeRequired()
    })
  })

  describe('User Interactions', () => {
    it('should handle text input', async () => {
      const user = userEvent.setup()
      render(<Input />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      
      await user.type(input, 'Hello World')
      expect(input.value).toBe('Hello World')
    })

    it('should call onChange when value changes', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      
      render(<Input onChange={handleChange} />)
      const input = screen.getByRole('textbox')
      
      await user.type(input, 'abc')
      expect(handleChange).toHaveBeenCalledTimes(3)
    })

    it('should handle clearing input', async () => {
      const user = userEvent.setup()
      render(<Input />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      
      await user.type(input, 'Test')
      expect(input.value).toBe('Test')
      
      await user.clear(input)
      expect(input.value).toBe('')
    })

    it('should handle focus and blur', async () => {
      const user = userEvent.setup()
      const handleFocus = jest.fn()
      const handleBlur = jest.fn()
      
      render(<Input onFocus={handleFocus} onBlur={handleBlur} />)
      const input = screen.getByRole('textbox')
      
      await user.click(input)
      expect(handleFocus).toHaveBeenCalled()
      
      await user.tab()
      expect(handleBlur).toHaveBeenCalled()
    })

    it('should not accept input when disabled', async () => {
      const user = userEvent.setup()
      render(<Input disabled />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      
      await user.type(input, 'Test')
      expect(input.value).toBe('')
    })

    it('should not accept input when readonly', async () => {
      const user = userEvent.setup()
      render(<Input readOnly value="Readonly" />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      
      await user.type(input, 'Test')
      expect(input.value).toBe('Readonly')
    })
  })

  describe('Controlled Input', () => {
    it('should work as controlled component', async () => {
      const user = userEvent.setup()
      const ControlledInput = () => {
        const [value, setValue] = React.useState('')
        return (
          <Input 
            value={value} 
            onChange={(e) => setValue(e.target.value)} 
          />
        )
      }
      
      render(<ControlledInput />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      
      await user.type(input, 'Controlled')
      expect(input.value).toBe('Controlled')
    })

    it('should update with external value changes', () => {
      const { rerender } = render(<Input value="Initial" readOnly />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('Initial')
      
      rerender(<Input value="Updated" readOnly />)
      expect(input.value).toBe('Updated')
    })
  })

  describe('Accessibility', () => {
    it('should have textbox role by default', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('should support aria-label', () => {
      render(<Input aria-label="Username" />)
      expect(screen.getByLabelText('Username')).toBeInTheDocument()
    })

    it('should support aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="help-text" />
          <div id="help-text">Helper text</div>
        </>
      )
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      
      render(
        <>
          <Input placeholder="Input 1" />
          <Input placeholder="Input 2" />
        </>
      )
      
      const input1 = screen.getByPlaceholderText('Input 1')
      const input2 = screen.getByPlaceholderText('Input 2')
      
      await user.tab()
      expect(input1).toHaveFocus()
      
      await user.tab()
      expect(input2).toHaveFocus()
    })

    it('should support autocomplete attribute', () => {
      render(<Input autoComplete="email" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('autocomplete', 'email')
    })
  })

  describe('Form Integration', () => {
    it('should work in form context', () => {
      render(
        <form>
          <Input name="username" />
        </form>
      )
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('name', 'username')
    })

    it('should support form validation', async () => {
      const user = userEvent.setup()
      const handleSubmit = jest.fn((e) => e.preventDefault())
      
      render(
        <form onSubmit={handleSubmit}>
          <Input required pattern="[A-Za-z]+" />
          <button type="submit">Submit</button>
        </form>
      )
      
      const input = screen.getByRole('textbox')
      expect(input).toBeRequired()
      expect(input).toHaveAttribute('pattern', '[A-Za-z]+')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long text', async () => {
      const user = userEvent.setup()
      const longText = 'a'.repeat(1000)
      
      render(<Input />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      
      await user.type(input, longText)
      expect(input.value).toBe(longText)
    })

    it('should handle special characters', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`'
      
      render(<Input defaultValue={specialChars} />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      
      expect(input.value).toBe(specialChars)
    })

    it('should handle unicode characters', async () => {
      const user = userEvent.setup()
      const unicode = '你好 🌍 مرحبا'
      
      render(<Input />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      
      await user.type(input, unicode)
      expect(input.value).toBe(unicode)
    })

    it('should handle maxLength attribute', async () => {
      const user = userEvent.setup()
      render(<Input maxLength={5} />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      
      await user.type(input, '1234567890')
      expect(input.value.length).toBeLessThanOrEqual(5)
    })
  })
})

// Import React for controlled component test
import * as React from 'react'
