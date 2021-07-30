import Highway from '@dogstudio/highway'
import { gsap } from 'gsap'

class Slide extends Highway.Transition {
    in({from, to, done}) {
        const tl = gsap.timeline({
            duration: 0.5,
            onComplete() {
                from.remove()
                done()
            }
        })
        tl.fromTo(to, { transform: "translateX(150%)"}, { transform: "translateX(0%)" })
    }
    out({from, done}) {
        const tl = gsap.timeline()
        tl.to(from, {transform: "translateX(-150%)"})
        done()
    }
}

export default Slide