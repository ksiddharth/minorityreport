package com.minorityreport.backgroundcameracapture;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.apache.commons.io.IOUtils;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.mime.HttpMultipartMode;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.entity.mime.content.InputStreamBody;
import org.apache.http.impl.client.DefaultHttpClient;

import android.hardware.Camera;
import android.hardware.Camera.AutoFocusCallback;
import android.hardware.Camera.PictureCallback;
import android.media.MediaPlayer;
import android.media.MediaPlayer.OnPreparedListener;
import android.net.UrlQuerySanitizer;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.LinearLayout.LayoutParams;
import android.widget.VideoView;

import com.google.android.youtube.player.YouTubePlayer;
import com.google.android.youtube.player.YouTubePlayer.ErrorReason;
import com.google.android.youtube.player.YouTubePlayerView;

public class CameraActivity extends YouTubeFailureRecoveryActivity implements YouTubePlayer.PlayerStateChangeListener{

	private CameraPreview mPreview;

	private VideoView mVideoView;

	private Handler mHandler;

	private static Integer photoCounter = 1;

	private static final String CLASS_NAME = CameraActivity.class.getCanonicalName();

	private static final String YOUTUBE_EXPRESSION = "https://www.youtube.com";
	
	private YouTubePlayer mYouTubePlayer;
	
	private YouTubePlayerView mYouTubePlayerView;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		
		super.onCreate(savedInstanceState);

		//Hide Action Bar
		getWindow().requestFeature(Window.FEATURE_ACTION_BAR);
		getActionBar().hide();

		setContentView(R.layout.activity_camera_launcher);

		//Mark as full screen activity
		getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,WindowManager.LayoutParams.FLAG_FULLSCREEN);

		//Initialize camera and its preview
		mPreview = new CameraPreview(this);

		//Initialize video view
		mVideoView = (VideoView) findViewById(R.id.videoView);
		
		//set youtube player view
		mYouTubePlayerView = (YouTubePlayerView) findViewById(R.id.youtubePlayer);
		
		//Initialize youtube player
		mYouTubePlayerView.initialize(DeveloperKey.DEVELOPER_KEY, this);

		//Set video looping
		mVideoView.setOnPreparedListener(new OnPreparedListener() {
			@Override
			public void onPrepared(MediaPlayer mp) {
				mp.setLooping(true);
			}
		});

		//Add camera preview to the layout
		FrameLayout preview = (FrameLayout) findViewById(R.id.camera_preview);
		preview.addView(mPreview);

		//Handlers for debug buttons
		Button captureButton = (Button) findViewById(R.id.button_capture);
		captureButton.setOnClickListener(new View.OnClickListener() {
			@Override
			public void onClick(View v) {
				// get an image from the camera
				mPreview.mCamera.autoFocus(new AutoFocusCallback() {
					public void onAutoFocus(boolean success, Camera camera) {
						if (success) {
							camera.takePicture(null, null, mPicture);
						}
					}
				});
			}
		});

		Button playButton = (Button) findViewById(R.id.button_play);
		playButton.setOnClickListener(new View.OnClickListener() {
			@Override
			public void onClick(View v) {
				playWatsonVideo();
			}
		});

		//Play the watson video
		playWatsonVideo();
	}

	public void useHandler() {
		mHandler = new Handler();
		mHandler.postDelayed(mRunnable, 3000);
	}

	private Runnable mRunnable = new Runnable() {
		@Override
		public void run() {
			Log.d(CLASS_NAME, "Camera picture call!");
			// get an image from the camera
			mPreview.mCamera.autoFocus(new AutoFocusCallback() {
				public void onAutoFocus(boolean success, Camera camera) {
					Log.d(CLASS_NAME, "Autofocus call back");
					if (success) {
						Log.d(CLASS_NAME, "Autofocus call back - Success");
						camera.takePicture(null, null, mPicture);
					}
				}
			});
		}
	};

	private void playWatsonVideo() {
		mVideoView.setVideoPath("android.resource://" + getPackageName() + "/" + R.drawable.watson);
		mVideoView.start();
	}

	private PictureCallback mPicture = new PictureCallback() {

		@Override
		public void onPictureTaken(byte[] data, Camera camera) {

			Log.d(CLASS_NAME, "Image taken!!!!:" + photoCounter);

			try {
				File newFolder = new File(
						Environment.getExternalStorageDirectory(), "Watson");

				if (!newFolder.exists()) {
					newFolder.mkdir();
				}
				try {
					File file = new File(newFolder, "MyTest" + photoCounter
							+ ".jpg");
					FileOutputStream outStream = null;
					file.createNewFile();
					outStream = new FileOutputStream(file);
					outStream.write(data);
					outStream.close();

					new PostImage().execute(file.getAbsolutePath());
					
					mPreview.mCamera.stopPreview();
					mPreview.mCamera.startPreview();

				} catch (Exception ex) {
					Log.d(CLASS_NAME,"ex: " + ex);
				}
			} catch (Exception e) {
				Log.d(CLASS_NAME,"e: " + e);
			}
		}
	};
	
	/**
	 * 
	 * @author 914854
	 * @class PostImage - Used to send the capture image to the server
	 * 
	 */
	private class PostImage extends AsyncTask<String, Integer, Double> {

		private static final String URL_US = "http://advertisement-delivery-system.mybluemix.net/alchemy/processImage";

		private String videoID;

		public PostImage() {

		}
		
		private void setFullScreen(){
			LinearLayout.LayoutParams playerParams = (LinearLayout.LayoutParams) mYouTubePlayerView.getLayoutParams();
			playerParams.width = LayoutParams.MATCH_PARENT;
			playerParams.height = LayoutParams.MATCH_PARENT;
			mYouTubePlayerView.setLayoutParams(playerParams);
		}

		@Override
		protected Double doInBackground(String... params) {
			Log.d(CLASS_NAME,"PostImage.doInBackground()");
			postData(params[0]);
			return null;
		}

		protected void onPostExecute(Double result) {
			if (videoID != null) {
				Log.d(CLASS_NAME,"Successful playback from post execute:"+videoID);
				mVideoView.stopPlayback();
				mVideoView.setVisibility(View.GONE);
				mYouTubePlayerView.setVisibility(View.VISIBLE);
				setFullScreen();
				Log.e(CLASS_NAME, videoID);
				mYouTubePlayer.loadVideo(videoID);
			}
		}

		protected void onProgressUpdate(Integer... progress) {
		}

		public void postData(String fileURI) {
			// Create a new HttpClient and Post Header
			Log.d(CLASS_NAME,"PostImage.postData()");
			try {

				HttpClient httpclient = new DefaultHttpClient();
				HttpPost httppost = new HttpPost(URL_US);

				InputStream inputStream;
				byte[] data;

				inputStream = new FileInputStream(new File(fileURI));

				data = IOUtils.toByteArray(inputStream);

				InputStreamBody inputStreamBody = new InputStreamBody(
						new ByteArrayInputStream(data), "pic.jpg");

				MultipartEntityBuilder multipartEntity = MultipartEntityBuilder
						.create();
				multipartEntity.setMode(HttpMultipartMode.BROWSER_COMPATIBLE);
				multipartEntity.addPart("image", inputStreamBody);

				httppost.setEntity(multipartEntity.build());

				HttpResponse response = httpclient.execute(httppost);

				inputStream.close();

				Log.d(CLASS_NAME,"Response***********************:"
						+ response.getStatusLine());

				BufferedReader buf = new BufferedReader(new InputStreamReader(
						response.getEntity().getContent()));

				String line = buf.readLine();

				Log.d(CLASS_NAME,"Printing reponse");


				try {
					Log.d(CLASS_NAME,"url:" + line);
					if (line.contains(YOUTUBE_EXPRESSION)) {
						Log.d(CLASS_NAME,"Valid youtube URL");
						videoID = extractYoutubeId(line);
						Log.d(CLASS_NAME,"This is the videoID:"+videoID);
					}
					else{
						mHandler.postDelayed(mRunnable, 3000);
					}
				} catch (Exception e) {
					e.printStackTrace();
				}

			} catch (Exception e) {
				e.printStackTrace();
			}

		}

		public String extractYoutubeId(String url) {
			
			Log.e(CLASS_NAME, url);
			UrlQuerySanitizer sanitizer = new UrlQuerySanitizer(); 
			sanitizer.setAllowUnregisteredParamaters(true); 
			sanitizer.parseUrl(url); 
			String id = sanitizer.getValue("v"); 
			
			id = id.replace("_", "");
			
			Log.e(CLASS_NAME, id);
			return id;
		}
	}
	
	 @Override
	  public void onInitializationSuccess(YouTubePlayer.Provider provider, YouTubePlayer player, boolean wasRestored) {
		Log.d(CLASS_NAME,"CameraActivity.onInitializationSuccess()");
		
	    this.mYouTubePlayer = player;
	    // Specify that we want to handle fullscreen behavior ourselves.
	    
	    this.mYouTubePlayer.setPlayerStateChangeListener(this);
	    
	    player.addFullscreenControlFlag(YouTubePlayer.FULLSCREEN_FLAG_CUSTOM_LAYOUT);
	    
	    //Initialize image capture event
	    Log.d(CLASS_NAME,"Trigerring camera capture timer!");
	  	useHandler();
	    	
	  }

	  @Override
	  protected YouTubePlayer.Provider getYouTubePlayerProvider() {
	    return mYouTubePlayerView;
	  }

	
	@Override
	public void onVideoEnded() {
		// TODO Auto-generated method stub
		Log.d(CLASS_NAME,"CameraActivity.onVideoEnded()");
		mYouTubePlayerView.setVisibility(View.INVISIBLE);
		mVideoView.setVisibility(View.VISIBLE);
		playWatsonVideo();
		mHandler.postDelayed(mRunnable, 3000);
	}

	@Override
	public void onAdStarted() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void onError(ErrorReason arg0) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void onLoaded(String arg0) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void onLoading() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void onVideoStarted() {
		// TODO Auto-generated method stub
		
	}

}