if ( document.querySelector( '#register' ) )
    document.querySelector( '#register' ).addEventListener( 'submit', ( e ) => {
        e.preventDefault()
        let data = Helpers.getFormData( e.target )
        fetch( e.target.action, {
            method: e.target.method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( data )
        } ).then( resp => resp.json() ).then( data => {

            if ( data.status ) {
                Helpers.alert( 'User register OK.' );
                setTimeout( () => { location.href = '/login.html' }, 3000 );
            } else {
                Helpers.alert( 'User already exists or other problems.' );
            }

        } ).catch( e => { console.error( e ); } );
    } );

if ( document.querySelector( '#login' ) )
    document.querySelector( '#login' ).addEventListener( 'submit', ( e ) => {
        e.preventDefault();
        let data = Helpers.getFormData( e.target );
        fetch( e.target.action, {
            method: e.target.method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( data )
        } ).then( resp => resp.json() ).then( data => {

            if ( data.status ) {
                Helpers.alert( 'User Login OK.' );
                location.href = '/user.html';
            } else {
                Helpers.alert( 'User and/or password not good.' );
            }


        } ).catch( e => { console.error( e ); } );
    } );

console.log( 'users loaded' )