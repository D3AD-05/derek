import { defineComponent, ref, onMounted, onUnmounted, computed, type PropType } from 'vue'

interface OrbitChar {
  char: string
  ring: 1 | 2 | 3 | 4
  topOffset: number
  leftOffset: number
  fontSize: string
  color: string
  opacity: number
  glow: string
  animationDelay: string
  reverse?: boolean
}

const SUBJECTS = [
  'Maths',
  'Science',
  'History',
  'Culture',
  'Geography',
  'Art',
  'Music',
  'Literature',
]

const ORBIT_CHARS: OrbitChar[] = [
  {
    char: '?',
    ring: 1,
    topOffset: -105,
    leftOffset: -18,
    fontSize: '2.2rem',
    color: '#FF6B6B',
    opacity: 0.9,
    glow: '#FF6B6B88',
    animationDelay: '0s',
  },
  {
    char: '¿',
    ring: 2,
    topOffset: -160,
    leftOffset: -16,
    fontSize: '1.8rem',
    color: '#FFD93D',
    opacity: 0.85,
    glow: '#FFD93D66',
    animationDelay: '0s',
  },
  {
    char: '？',
    ring: 2,
    topOffset: 145,
    leftOffset: -15,
    fontSize: '1.5rem',
    color: '#4D96FF',
    opacity: 0.75,
    glow: '#4D96FF55',
    animationDelay: '0s',
    reverse: true,
  },
  {
    char: '?',
    ring: 3,
    topOffset: -220,
    leftOffset: -20,
    fontSize: '2.8rem',
    color: '#6BCB77',
    opacity: 0.8,
    glow: '#6BCB7766',
    animationDelay: '0s',
  },
  {
    char: '¿',
    ring: 3,
    topOffset: -220,
    leftOffset: -18,
    fontSize: '1.6rem',
    color: '#FF6B6B',
    opacity: 0.65,
    glow: '#FF6B6B44',
    animationDelay: '-2.5s',
  },
  {
    char: '?',
    ring: 3,
    topOffset: -220,
    leftOffset: -16,
    fontSize: '2rem',
    color: '#C77DFF',
    opacity: 0.7,
    glow: '#C77DFF55',
    animationDelay: '-5s',
  },
  {
    char: '？',
    ring: 4,
    topOffset: -290,
    leftOffset: -22,
    fontSize: '3.2rem',
    color: '#FFD93D',
    opacity: 0.6,
    glow: '#FFD93D44',
    animationDelay: '0s',
  },
  {
    char: '¿',
    ring: 4,
    topOffset: -290,
    leftOffset: -16,
    fontSize: '2rem',
    color: '#4D96FF',
    opacity: 0.5,
    glow: '#4D96FF33',
    animationDelay: '-5.5s',
  },
]

const GUIDE_RINGS = [
  { size: 210, color: 'rgba(255,107,107,0.15)' },
  { size: 320, color: 'rgba(77,150,255,0.10)' },
  { size: 440, color: 'rgba(107,203,119,0.08)' },
  { size: 580, color: 'rgba(199,125,255,0.07)' },
]

const RING_DURATION: Record<number, number> = { 1: 3.2, 2: 5, 3: 7.5, 4: 11 }

export default defineComponent({
  name: 'QuizLoader',

  props: {
    visible: {
      type: Boolean,
      default: true,
    },
    autoDismissMs: {
      type: Number,
      default: 0,
    },
    subjects: {
      type: Array as PropType<string[]>,
      default: () => SUBJECTS,
    },
    backdropOpacity: {
      type: Number,
      default: 0.72,
    },
    backdropBlur: {
      type: Number,
      default: 14,
    },
  },

  emits: ['dismiss'],

  setup(props, { emit }) {
    const hiding = ref(false)
    const subjectIdx = ref(0)
    const subjectVisible = ref(true)

    let subjectTimer: ReturnType<typeof setInterval> | null = null
    let dismissTimer: ReturnType<typeof setTimeout> | null = null

    const safeSubjects = computed(() => (props.subjects.length > 0 ? props.subjects : SUBJECTS))
    const currentSubject = computed(() => safeSubjects.value[subjectIdx.value])

    function cycleSubject() {
      subjectVisible.value = false
      setTimeout(() => {
        subjectIdx.value = (subjectIdx.value + 1) % safeSubjects.value.length
        subjectVisible.value = true
      }, 260)
    }

    function dismiss() {
      hiding.value = true
      setTimeout(() => emit('dismiss'), 500)
    }

    onMounted(() => {
      subjectTimer = setInterval(cycleSubject, 1300)
      if (props.autoDismissMs > 0) {
        dismissTimer = setTimeout(dismiss, props.autoDismissMs)
      }
    })

    onUnmounted(() => {
      if (subjectTimer) clearInterval(subjectTimer)
      if (dismissTimer) clearTimeout(dismissTimer)
    })

    return { hiding, currentSubject, subjectVisible, dismiss }
  },

  render() {
    if (!this.visible) return null

    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Space+Mono:wght@400;700&display=swap');

          @keyframes ql-orbitCW    { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
          @keyframes ql-orbitCCW   { from { transform: rotate(0deg) } to { transform: rotate(-360deg) } }
          @keyframes ql-counterCW  { from { transform: rotate(0deg) } to { transform: rotate(-360deg) } }
          @keyframes ql-counterCCW { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }

          @keyframes ql-pulseRing {
            0% { transform: scale(0.92); box-shadow: 0 0 0 0 rgba(255,107,107,0.55); }
            70% { transform: scale(1); box-shadow: 0 0 0 22px rgba(255,107,107,0); }
            100% { transform: scale(0.92); box-shadow: 0 0 0 0 rgba(255,107,107,0); }
          }
          @keyframes ql-bobble {
            0%, 100% { transform: translateY(0px) }
            50% { transform: translateY(-8px) }
          }
          @keyframes ql-textDrift {
            0%, 100% { transform: translateY(0px) }
            50% { transform: translateY(4px) }
          }
          @keyframes ql-barLoop {
            0% { transform: translateX(-130%) scaleX(0.7); opacity: 0.85; }
            50% { transform: translateX(10%) scaleX(1); opacity: 1; }
            100% { transform: translateX(230%) scaleX(0.7); opacity: 0.85; }
          }
          @keyframes ql-fadeIn { from { opacity: 0 } to { opacity: 1 } }
          @keyframes ql-fadeOut { from { opacity: 1 } to { opacity: 0; pointer-events: none } }

          .ql-orb1-wrap { animation: ql-orbitCW 3.2s linear infinite; }
          .ql-orb1-char { animation: ql-counterCW 3.2s linear infinite; }
          .ql-orb2-wrap { animation: ql-orbitCCW 5s linear infinite; }
          .ql-orb2-char { animation: ql-counterCCW 5s linear infinite; }
          .ql-orb3-wrap { animation: ql-orbitCW 7.5s linear infinite; }
          .ql-orb3-char { animation: ql-counterCW 7.5s linear infinite; }
          .ql-orb4-wrap { animation: ql-orbitCCW 11s linear infinite; }
          .ql-orb4-char { animation: ql-counterCCW 11s linear infinite; }

          .ql-dismiss:hover { color: rgba(255,255,255,0.55) !important; }
        `}</style>

        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            fontFamily: "'Space Mono', monospace",
            backgroundColor: `rgba(10, 10, 10, ${this.backdropOpacity})`,
            backdropFilter: `blur(${this.backdropBlur}px)`,
            WebkitBackdropFilter: `blur(${this.backdropBlur}px)`,
            animation: this.hiding ? 'ql-fadeOut 0.5s ease forwards' : 'ql-fadeIn 0.3s ease',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              backgroundImage: [
                'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
                'linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
              ].join(', '),
              backgroundSize: '40px 40px',
            }}
          />

          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
            {GUIDE_RINGS.map((ring, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: `${ring.size}px`,
                  height: `${ring.size}px`,
                  border: `1px solid ${ring.color}`,
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                }}
              />
            ))}

            {ORBIT_CHARS.map((orbit, i) => {
              const duration = RING_DURATION[orbit.ring]
              const wrapCls = `ql-orb${orbit.ring}-wrap`
              const charCls = `ql-orb${orbit.ring}-char`

              const isNormallyOdd = orbit.ring % 2 === 1
              const reverseAnim = orbit.reverse
                ? isNormallyOdd
                  ? `ql-orbitCCW ${duration}s linear infinite`
                  : `ql-orbitCW ${duration}s linear infinite`
                : undefined

              return (
                <div
                  key={i}
                  class={orbit.reverse ? undefined : wrapCls}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 0,
                    height: 0,
                    transformOrigin: 'center center',
                    animationDelay: orbit.animationDelay,
                    ...(reverseAnim ? { animation: reverseAnim } : {}),
                  }}
                >
                  <div
                    class={charCls}
                    style={{
                      position: 'absolute',
                      top: `${orbit.topOffset}px`,
                      left: `${orbit.leftOffset}px`,
                      fontSize: orbit.fontSize,
                      color: orbit.color,
                      opacity: orbit.opacity,
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: 900,
                      lineHeight: 1,
                      userSelect: 'none',
                      transformOrigin: 'center center',
                      textShadow: `0 0 16px ${orbit.glow}`,
                      animationDelay: orbit.animationDelay,
                    }}
                  >
                    {orbit.char}
                  </div>
                </div>
              )
            })}

            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(26,26,26,0.95), rgba(42,42,42,0.90))',
                border: '3px solid #FF6B6B',
                boxShadow: '0 0 40px rgba(255,107,107,0.25), inset 0 0 20px rgba(255,107,107,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                position: 'relative',
                animation: 'ql-bobble 1.8s ease-in-out infinite, ql-pulseRing 2s ease-out infinite',
              }}
            >
              <span
                style={{
                  fontSize: '4rem',
                  color: '#FF6B6B',
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 900,
                  lineHeight: 1,
                  textShadow: '0 0 30px #FF6B6B',
                }}
              >
                ?
              </span>
            </div>

            <div style={{ marginTop: '44px', animation: 'ql-textDrift 2.1s ease-in-out infinite' }}>
              <div
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.3em',
                  color: '#FF6B6B',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                QUIZ ENGINE
              </div>

              <div
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: '#F0F0F0',
                  letterSpacing: '0.05em',
                }}
              >
                {'Loading '}
                <span
                  style={{
                    color: '#FF6B6B',
                    display: 'inline-block',
                    minWidth: '12ch',
                    textAlign: 'left',
                    transition: 'opacity 0.24s ease, transform 0.24s ease',
                    opacity: this.subjectVisible ? 1 : 0,
                    transform: this.subjectVisible ? 'translateY(0)' : 'translateY(14px)',
                  }}
                >
                  {this.currentSubject}
                </span>
                {'...'}
              </div>
            </div>

            <div
              style={{
                marginTop: '28px',
                width: '280px',
                height: '4px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '99px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: '42%',
                  height: '100%',
                  background:
                    'linear-gradient(90deg, rgba(255,107,107,0), #FF6B6B, #FFD93D, rgba(255,217,61,0))',
                  borderRadius: '99px',
                  willChange: 'transform',
                  animation: 'ql-barLoop 1.35s cubic-bezier(0.4,0,0.2,1) infinite',
                }}
              />
            </div>
            {/* 
            <div
              class="ql-dismiss"
              onClick={this.dismiss}
              style={{
                marginTop: '32px',
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.2)',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              click to dismiss
            </div> */}
          </div>
        </div>
      </>
    )
  },
})
