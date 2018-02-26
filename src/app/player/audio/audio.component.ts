import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core'
import { Observable, Subscription } from 'rxjs'
import { PlayerService } from '../player.service'

@Component({
  selector: 'player-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.css']
})
export class AudioComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() onCurrentTimeUpdate = new EventEmitter<number>()
  @Output() onLoad = new EventEmitter()
  @Input() src: string = ''
  private audio: HTMLAudioElement
  private timeSubscription: Subscription
  private loadSubscription: Subscription
  public paused: boolean = false
  public currentTime: string
  public duration: string

  constructor(
    private service: PlayerService
  ) {}

  ngOnInit() {
    this.audio = new Audio()
    this.currentTime = this.service.formatTime(0)
    this.duration = this.service.formatTime(0)
  }

  ngAfterViewInit() {
    // Loads new audio source
    this.loadAudioSource(this.src)

    // Subscribes timeupdate
    this.timeSubscription = Observable
      .fromEvent(this.audio, 'timeupdate')
      .subscribe(this.handleAudioTimeUpdate)

    // Subscribe to loaded event
    this.loadSubscription = Observable
      .fromEvent(this.audio, 'loadeddata')
      .subscribe(this.handleAudioLoaded)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.service.hasPropertyChanged(changes.src)) {
      this.loadAudioSource(changes.src.currentValue)
    }
  }

  ngOnDestroy() {
    // Unsubscribe
    this.timeSubscription.unsubscribe()
    this.loadSubscription.unsubscribe()

    // Destroy audio tag
    this.loadAudioSource('')
    this.audio.load()
  }

  initAudio(): HTMLAudioElement {
    const audio = new Audio()
    audio['autobuffer'] = true
    audio.autoplay = false
    audio.preload = 'auto'

    return audio
  }

  loadAudioSource(src: string) {
    this.audio.pause()
    this.audio.src = src
  }

  handleAudioLoaded = (e: HTMLMediaElementEventMap) => {
    this.onLoad.emit()
    this.duration = this.service.formatTime(this.audio.duration)
  }

  handleAudioTimeUpdate = (e: HTMLMediaElementEventMap) => {
    this.currentTime = this.service.formatTime(this.audio.currentTime)
    this.onCurrentTimeUpdate.emit(this.audio.currentTime)
  }

  handleAudioPlayPause() {
    if (this.audio.paused) {
      this.audio.play()
      this.paused = true
    } else {
      this.audio.pause()
      this.paused = false
    }
  }

}