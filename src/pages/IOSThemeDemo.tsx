import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function IOSThemeDemo() {
  const [_count, setCount] = useState(0)

  return (
    <div className="p-4">
      <h1>iOS Theme Demo</h1>
      <Button onClick={() => setCount(c => c + 1)}>Click me</Button>
    </div>
  )
} 