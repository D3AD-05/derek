import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PublicNavBar',
  setup() {
    // You can add reactive state or methods here if needed
    return () => (
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 2rem',
          background: '#fff',
          borderBottom: '1px solid #eee',
        }}
      >
        <img src="/sampleLogo.png" alt="Logo" class="h-20" />
        <div style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Derek</div>
        <ul
          style={{
            display: 'flex',
            listStyle: 'none',
            gap: '1.5rem',
            margin: 0,
            padding: 0,
          }}
        ></ul>
      </nav>
    )
  },
})
