import { Component, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { SongsModalPage } from '../songs-modal/songs-modal.page';
import { PlatziMusicService } from '../utils/services/platzi-music.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnDestroy {
  private musicSubs: Subscription;

  public artists = [];
  public songs = [];
  public albums = [];
  public singleTrack: { preview_url: string; playing: boolean; name: string } =
    {
      preview_url: '',
      playing: false,
      name: '',
    };
  public currentTrack: HTMLAudioElement;
  public newTime: number;
  public progress: number;

  slideOpts = {
    initialSlide: 2,
    slidesPerView: 4,
    centeredSlides: true,
    speed: 400,
  };

  constructor(
    private musicService: PlatziMusicService,
    public modalController: ModalController
  ) {}

  ionViewDidEnter() {
    this.getData();
  }

  getData() {
    this.musicSubs = this.musicService.musicList$.subscribe((resData) => {
      this.songs = resData.filter((el) => el.album_type == 'single');
      this.albums = resData.filter((el) => el.album_type == 'album');
    });
    this.artists = this.musicService.getArtistList().items;
    this.musicService.getNewReleases();
  }

  async showSongs(targetSelected: any, elType?: string) {
    const modal = await this.modalController.create({
      component: SongsModalPage,
      cssClass: 'my-custom-class',
      componentProps: {
        element_id: targetSelected.id,
        element_name: targetSelected.name,
        operator: elType,
      },
    });

    // process data returned by modal on close event
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned.data) {
        this.singleTrack = dataReturned.data;
        this.singleTrack.playing = false;
      }
    });

    return await modal.present();
  }

  play() {
    // native api to play audio
    if (this.singleTrack.name == undefined) return;

    this.currentTrack = new Audio(this.singleTrack.preview_url);
    this.currentTrack.play();

    this.currentTrack.addEventListener('timeupdate', () => {
      this.newTime = this.currentTrack.currentTime;
      this.progress =
        this.currentTrack.currentTime / this.currentTrack.duration;
    });
    this.singleTrack.playing = true;
  }

  pause() {
    if (this.singleTrack.name == undefined) return;

    this.currentTrack.pause();
    this.singleTrack.playing = false;
  }

  ngOnDestroy() {
    this.musicSubs.unsubscribe();
  }
}
