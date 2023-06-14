/**
 *
 *
 *
 *
 *
 *
 */
class Helpers {

    /**
     * Beschreibung....
     * @param {*} form
     * @returns
     */
    static getFormData( form ) {
        let data = {};
        for ( let pair of new FormData( form ) ) {
            data[ pair[ 0 ] ] = pair[ 1 ];
        }
        return data;
    }

    /**
     *
     * @param {string} s
     */
    static alert( s ) {
        let d = document.createElement( 'div' );
        d.id = 'alertMessage';
        d.innerHTML = s;
        let body = document.querySelector( 'body' );
        let old = document.querySelector( '#alertMessage' );
        if ( old ) {
            body.removeChild( old );
        }
        body.appendChild( d );
    }

}
console.log( 'helpers loaded' )

