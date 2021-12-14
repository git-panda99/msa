import { HttpClient } from '@angular/common/http';
import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { EventVideoService } from 'src/app/shared/event-video.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.page.html',
  styleUrls: ['./create-event.page.scss'],
})
export class CreateEventPage implements OnInit {
  eventForm: FormGroup;
  fileToUpload: File = null;
  userId = null;
  imageURL;

  constructor(
    private http: HttpClient,
    private eventVidoeAPI: EventVideoService,
    private router: Router,
    public fb: FormBuilder,
    private zone: NgZone,
    private sanitizer: DomSanitizer
  ) {
    this.eventForm = this.fb.group({
      title: [''],
      posterUrl: "",
      description: [''],
      price: 0,
      beginDate: "2012-10-25T12:00:00.000Z",
      endDate: "2012-10-25T12:00:00.000Z",
      type: "",
      source: "",
      videoUrl: ""

    })
  }

  ngOnInit() { }

  attachFile(e){
    if (e.target.files.length == 0) {
      console.log("No file selected!");
      return
    }
    let file: File = e.target.files[0];
    this.fileToUpload = file;
  }

  uploadImage(f){
    let formData = new FormData(); 
    formData.append('file', this.fileToUpload, this.fileToUpload.name); 
    this.http.post(environment.api_url+'/files/upload', formData).subscribe((res) => {

    console.log(res);
    this.imageURL = environment.api_url + '/files/' + res['filename'];
    });
  }

  onFormSubmit() {
    if (!this.eventForm.valid) {
      return false;
    } else {
      this.eventVidoeAPI.addEventVideo(this.eventForm.value)
        .subscribe((res) => {
          this.zone.run(() => {
            console.log(res)
            this.eventForm.reset();
            this.router.navigate(['/tabs/my-events']);
          })
        });
    }
  }

}
